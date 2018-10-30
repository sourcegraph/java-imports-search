import { EMPTY, from, of } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import * as sourcegraph from 'sourcegraph'

export function activate(): void {
   sourcegraph.search.registerQueryTransformer({
       transformQuery: (query: string) => {
           const javaImportsRegex = /\bjava.imports:([^\s]*)/
           if (query.match(javaImportsRegex)) {
               const javaImportsFilter = query.match(javaImportsRegex)
               const javaPkg = javaImportsFilter && javaImportsFilter.length >= 1 ? javaImportsFilter[1] : ''
               const javaImport = '^import\\s(?:static\\s)?' + javaPkg + '[^\\s]*;$'
               return query.replace(javaImportsRegex  , `(${javaImport})`)
           }
           return query
        }
   })

   sourcegraph.workspace.onDidOpenTextDocument.subscribe(doc => {
        from(doc.text.split('\n')).pipe(
            concatMap(
                (line, lineNumber) => {
                    const javaPkgRegex = /^import\s(?:static\s)?([^\s]*)[^\\s]*;$/
                    const match = javaPkgRegex.exec(line);
                    if (match && match.length > 1) {
                        console.log(match)
                        // The match index depends on which regex pattern actually produced a match
                        const pkgName = match[1]
                        return of({lineNumber, pkgName});
                    }
                    return EMPTY;
                }
            ),
            toArray()
        ).subscribe(matches => {
            if (!matches) {
                return
            }
            if (
                sourcegraph.app.activeWindow &&
                sourcegraph.app.activeWindow.visibleViewComponents.length >
                    0
            ) {
                sourcegraph.app.activeWindow.visibleViewComponents[0].setDecorations(
                    null,
                    matches.map(match => ({
                            range: new sourcegraph.Range(
                                new sourcegraph.Position(match.lineNumber, 0),
                                new sourcegraph.Position(match.lineNumber, 0)
                            ),
                            after: {
                                contentText: ' See all usages',
                                linkURL: '/search?q=java.imports:' + match.pkgName,
                                backgroundColor: 'pink',
                                color: 'black'
                            }
                    })
                ))
            }
            });
    });

}
