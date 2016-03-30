zotero-bibtex-parse
=============
A JavaScript library that parses (Zotero-flavored) BibTeX. Forked from ORCID's
[bibtexParseJs](https://github.com/ORCID/bibtexParseJs).

This branch, `resilient`, represents a significant departure from ORCID's
version. Instead of parsing incrementally, this version attempts to identify the
edges of BibTeX entries so that if something goes wrong while parsing an entry,
it can simply move on to the next entry.

Testing has improved and now uses [Jasmine](http://jasmine.github.io/1.3/introduction.html).
Please file an [issue](https://github.com/apcshields/zotero-bibtex-parse/issues)
if you find something I've missed.

## Using in Browser
The `resilient` branch has dropped support for in-browser use.

## Using in [Node.js](http://nodejs.org/)
Install ```npm install git://github.com/apcshields/zotero-bibtex-parse.git#resilient```

```javascript
BibtexParser = require('zotero-bibtex-parse');

parser = new BibtexParser('@article{sample1,title={sample title}}');

sample = parser.parse()

console.log(sample);
```

**Returns** A parsed BibTeX file as a Javascript object:

```javascript
[ { entryType: 'article',
    citationKey: 'sample1',
    entryTags: { title: 'sample title' } } ]
```

## Contributing
Contributions are welcome. Please make sure the Jasmine specs
(```spec/```) reflect the changes and complete successfully.

## Credits
Early versions of this package were based on:

(c) 2010 Henrik Muehe. (MIT License)
[visit](https://code.google.com/p/bibtex-js/)

CommonJS port maintained by Mikola Lysenko
[visit](https://github.com/mikolalysenko/bibtex-parser)

ORCID's (rcpeter's) adaptation.

## License

This software is licensed under an MIT license, as follows:

Copyright © 2014 Andrew Shields

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Except as contained in this notice, the name(s) of the above copyright holders
shall not be used in advertising or otherwise to promote the sale, use or other
dealings in this Software without prior written authorization.
