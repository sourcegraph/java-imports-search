import { from, Subscription } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'
import * as sourcegraph from 'sourcegraph'
import { ExtensionContext } from 'sourcegraph'
import { resolveSettings, Settings } from './settings'

const decorationType = sourcegraph.app.createDecorationType && sourcegraph.app.createDecorationType()
const settings = resolveSettings(sourcegraph.configuration.get<Settings>().value)

export function activate(
    context: ExtensionContext = {
        subscriptions: new Subscription(),
    }
): void {
    context.subscriptions.add(
        sourcegraph.search.registerQueryTransformer({
            transformQuery: (query: string) => {
                const javaImportsRegex = /\bjava.imports:([^\s]*)/
                if (query.match(javaImportsRegex)) {
                    const javaImportsFilter = query.match(javaImportsRegex)
                    const javaPkg = javaImportsFilter && javaImportsFilter.length >= 1 ? javaImportsFilter[1] : ''
                    const javaImport = '^import\\s(?:static\\s)?' + javaPkg + '[^\\s]*;$'
                    return query.replace(javaImportsRegex, `${javaImport} lang:java patternType:regexp `)
                }
                return query
            },
        })
    )

    const editorsChanges = sourcegraph.app.activeWindowChanges
        ? from(sourcegraph.app.activeWindowChanges).pipe(
              filter(
                  (activeWindow): activeWindow is Exclude<typeof activeWindow, undefined> => activeWindow !== undefined
              ),
              switchMap(activeWindow =>
                  from(activeWindow.activeViewComponentChanges).pipe(map(() => activeWindow.visibleViewComponents))
              )
          )
        : from(sourcegraph.workspace.openedTextDocuments).pipe(
              map(() => (sourcegraph.app.activeWindow && sourcegraph.app.activeWindow.visibleViewComponents) || [])
          )

    context.subscriptions.add(
        editorsChanges.subscribe(codeEditors => {
            const codeEditor = codeEditors[0]
            if (!settings['javaImports.showAllUsagesLinks']) {
                return
            }

            const document = codeEditor.document
            if (document.languageId !== 'java') {
                return
            }

            const matches: { lineNumber: number; pkgName: string }[] = []
            if (codeEditor && document.text) {
                const lines = document.text.split('\n')
                lines.map((line, lineNumber) => {
                    const javaPkgRegex = /^import\s(?:static\s)?([^\s]*)[^\s]*;$/
                    const match = javaPkgRegex.exec(line)
                    if (match && match.length > 1) {
                        // The match index depends on which regex pattern actually produced a match
                        const pkgName = match[1]
                        matches.push({ lineNumber, pkgName })
                    }
                })

                if (matches.length > 0) {
                    codeEditor.setDecorations(
                        decorationType,
                        matches.map(match => ({
                            range: new sourcegraph.Range(
                                new sourcegraph.Position(match.lineNumber, 0),
                                new sourcegraph.Position(match.lineNumber, 0)
                            ),
                            after: {
                                contentText: 'See all usages',
                                linkURL: '/search?q=java.imports:' + match.pkgName + '&patternType=regexp',
                                backgroundColor: 'pink',
                                color: 'black',
                            },
                        }))
                    )
                }
            }
        })
    )
}
