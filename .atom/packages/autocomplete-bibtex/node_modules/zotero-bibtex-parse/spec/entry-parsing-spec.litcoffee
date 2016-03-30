    BibtexParser = require '../zotero-bibtex-parse'
    fs = require 'fs'

    describe('Entry parsing', ->
      it('should parse bracket-delimited entries', ->
        file = fs.readFileSync('./spec/sample_bibtex/bracket-delimited-entry-spec.bibtex', 'utf-8')
        parser = new BibtexParser file

        spyOn(parser, 'stringEntry').andCallThrough()
        spyOn(parser, 'preambleEntry').andCallThrough()
        spyOn(parser, 'commentEntry').andCallThrough()
        spyOn(parser, 'keyedEntry').andCallThrough()

        parser.parse()

        expect(parser.stringEntry.calls.length).toBe(1)
        expect(parser.preambleEntry.calls.length).toBe(1)
        expect(parser.commentEntry.calls.length).toBe(1)
        expect(parser.keyedEntry.calls.length).toBe(1)
      )

      it('should parse parenthesis-delimited entries', ->
        file = fs.readFileSync('./spec/sample_bibtex/parenthesis-delimited-entry-spec.bibtex', 'utf-8')
        parser = new BibtexParser file

        spyOn(parser, 'stringEntry').andCallThrough()
        spyOn(parser, 'preambleEntry').andCallThrough()
        spyOn(parser, 'commentEntry').andCallThrough()
        spyOn(parser, 'keyedEntry').andCallThrough()

        parser.parse()

        expect(parser.stringEntry.calls.length).toBe(1)
        expect(parser.preambleEntry.calls.length).toBe(1)
        expect(parser.commentEntry.calls.length).toBe(1)
        expect(parser.keyedEntry.calls.length).toBe(1)
      )

      describe('when attempting to parse a malformed entry', ->
        file = fs.readFileSync('./spec/sample_bibtex/malformed-entry-spec.bibtex', 'utf-8')
        parser = new BibtexParser file

        parser.parse()

        it('should skip entries without an entry type or entry body', ->
          expect(parser.entries.length).toBe(5)
        )

        it('should not incorporate content from malformed entries into well-formed entries', ->
          expect(parser.entries[0].entryType).toBe('comment')
          expect(parser.entries[0].entry).toBe('A valid comment.')

          expect(parser.entries[1].entryType).toBe('comment')
          expect(parser.entries[1].entry).toBe('Another valid comment.')

          expect(parser.entries[2].entryType).toBe('comment')
          expect(parser.entries[2].entry).toBe('Third valid comment.')

          expect(parser.entries[3].entryType).toBe('comment')
          expect(parser.entries[3].entry).toBe('')

          expect(parser.entries[4].entryType).toBe('comment')
          expect(parser.entries[4].entry).toBe('Fifth valid comment.')
        )
      )
    )

    describe('String-entry parsing', ->
      file = fs.readFileSync('./spec/sample_bibtex/string-spec.bibtex', 'utf-8')
      parser = undefined

      beforeEach ->
        parser = new BibtexParser file

        spyOn(parser, 'stringEntry').andCallThrough()

        parser.parse()

      it('should parse one string entry', ->
        expect(parser.stringEntry.calls.length).toBe(1)
      )

      it('should add one key-value pair to the @strings object', ->
        expect(Object.keys(parser.strings).length).toBe(13)
      )

      it('should parse a key and value', ->
        expect(parser.strings['var']).toBe('variable')
      )
    )

    describe('Preamble-entry parsing', ->
      file = fs.readFileSync('./spec/sample_bibtex/preamble-spec.bibtex', 'utf-8')
      parser = undefined

      beforeEach ->
        parser = new BibtexParser file

        spyOn(parser, 'preambleEntry').andCallThrough()

        parser.parse()

      it('should parse one preamble entry', ->
        expect(parser.preambleEntry.calls.length).toBe(1)
      )

      it('should add one object to the @entries array which has an .entryType of "preamble" and an .entry', ->
        expect(parser.entries.length).toBe(1)
        expect(parser.entries[0].entryType).toBe('preamble')
        expect(parser.entries[0].entry).toBeDefined()
      )

      it('should not alter the entry contents', ->
        expect(parser.entries[0].entry).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae accumsan mauris.')
      )
    )

    describe('Comment-entry parsing', ->
      file = fs.readFileSync('./spec/sample_bibtex/comment-spec.bibtex', 'utf-8')
      parser = undefined

      beforeEach ->
        parser = new BibtexParser file

        spyOn(parser, 'commentEntry').andCallThrough()

        parser.parse()

      it('should parse one comment entry', ->
        expect(parser.commentEntry.calls.length).toBe(1)
      )

      it('should add one object to the @entries array which has an .entryType of "comment" and an .entry', ->
        expect(parser.entries.length).toBe(1)
        expect(parser.entries[0].entryType).toBe('comment')
        expect(parser.entries[0].entry).toBeDefined()
      )

      it('should not alter the entry contents', ->
        expect(parser.entries[0].entry).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae accumsan mauris.')
      )
    )

    describe('Keyed-entry parsing', ->
      file = fs.readFileSync('./spec/sample_bibtex/article-spec.bibtex', 'utf-8')
      parser = undefined

      beforeEach ->
        parser = new BibtexParser file

        spyOn(parser, 'keyedEntry').andCallThrough()

        parser.parse()

      it('should parse one keyed entry', ->
        expect(parser.keyedEntry.calls.length).toBe(1)
      )

      it('should add one object to the @entries array which has an .entryType, a .citationKey, and an .entryTags', ->
        expect(parser.entries.length).toBe(1)
        expect(parser.entries[0].entryType).toBeDefined()
        expect(parser.entries[0].citationKey).toBeDefined()
        expect(parser.entries[0].entryTags).toBeDefined()
      )

      it('should parse the entryType', ->
        expect(parser.entries[0].entryType).toBe('article')
      )

      it('should parse the citationKey', ->
        expect(parser.entries[0].citationKey).toBe('RID:1118130922631-13')
      )

      it('should parse the entryTags (with appropriate type—String or Number—for field values)', ->
        entryTags = parser.entries[0].entryTags

        expect(Object.keys(entryTags).length).toBe(7)
        expect(entryTags['title']).toBe('Synthesis and structural characterization of unprecedented bis-asymmetric heteroscorpionate U(III) complexes: [U\\{kappa(3)-H2B(pz(tBu),(Me))(pz(Me,tBu))\\}(2)I] and [U\\{kappa(3) -H2B(pz(tBu,Me))( pz(Me2))\\}(2)I]')
        expect(entryTags['journal']).toBe('Inorganic Chemistry')
        expect(entryTags['year']).toBe(2003)
        expect(entryTags['author']).toBe('Maria, L and Domingos, A and Santos, I')
        expect(entryTags['volume']).toBe(42)
        expect(entryTags['number']).toBe(10)
        expect(entryTags['pages']).toBe('3323-3330')
      )
    )

    describe('Multi-entry parsing', ->
      file = fs.readFileSync('./spec/sample_bibtex/multi-entry-spec.bibtex', 'utf-8')
      parser = undefined

      beforeEach ->
        parser = new BibtexParser file

        spyOn(parser, 'stringEntry').andCallThrough()
        spyOn(parser, 'preambleEntry').andCallThrough()
        spyOn(parser, 'commentEntry').andCallThrough()
        spyOn(parser, 'keyedEntry').andCallThrough()

        parser.parse()

      it('should parse one string entry, one preamble entry, one keyed entry, and one comment entry', ->
        expect(parser.stringEntry.calls.length).toBe(1)
        expect(parser.preambleEntry.calls.length).toBe(1)
        expect(parser.keyedEntry.calls.length).toBe(1)
        expect(parser.commentEntry.calls.length).toBe(1)
      )

      it('should parse in order of: string entry, preamble entry, keyed entry, then comment entry', ->
        expect(parser.entries[0].entryType).toBe('preamble')
        expect(parser.entries[1].entryType).toBe('article')
        expect(parser.entries[2].entryType).toBe('comment')
      )
    )

    describe('Informal comment parsing', ->
      file = fs.readFileSync('./spec/sample_bibtex/informal-comment-spec.bibtex', 'utf-8')
      parser = undefined

      beforeEach ->
        parser = new BibtexParser file

        parser.parse()

      it('should parse informal comments before all entries', ->
        expect(parser.entries[0].entryType).toBe('comment')
        expect(parser.entries[0].entry).toBe('This is an informal comment.')
      )

      it('should parse informal comments between entries', ->
        expect(parser.entries[2].entryType).toBe('comment')
        expect(parser.entries[2].entry).toBe('This is a second informal comment.')
      )

      it('should parse informal comments after all entries', ->
        expect(parser.entries[6].entryType).toBe('comment')
        expect(parser.entries[6].entry).toBe('This is a final informal comment.')
      )

      it('should parse informal comments which run up agains entries', ->
        expect(parser.entries[4].entryType).toBe('comment')
        expect(parser.entries[4].entry).toBe('This is an informal comment which runs up against an entry.')
      )

      it('should not affect the parsing or content in formal entries', ->
        expect(parser.entries[1].entryType).toBe('article')
        expect(parser.entries[1].citationKey).toBe('sample_article')
        expect(Object.keys(parser.entries[1].entryTags).length).toBe(2)
        expect(parser.entries[1].entryTags['title']).toBe('Sample Article')
        expect(parser.entries[1].entryTags['author']).toBe('Johannes Ossian')

        expect(parser.entries[3].entryType).toBe('article')
        expect(parser.entries[3].citationKey).toBe('another_sample_article')
        expect(Object.keys(parser.entries[3].entryTags).length).toBe(2)
        expect(parser.entries[3].entryTags['title']).toBe('Another Sample Article')
        expect(parser.entries[3].entryTags['author']).toBe('Marcus Tischen')

        expect(parser.entries[5].entryType).toBe('article')
        expect(parser.entries[5].citationKey).toBe('third_sample_article')
        expect(Object.keys(parser.entries[5].entryTags).length).toBe(2)
        expect(parser.entries[5].entryTags['title']).toBe('Third Sample Article')
        expect(parser.entries[5].entryTags['author']).toBe('Marylin Osmer')
      )
    )

    describe('Value parsing', ->
      file = fs.readFileSync('./spec/sample_bibtex/string-concatenation-spec.bibtex', 'utf8')
      parser = new BibtexParser file
      parser.parse()

      it('should concatenate strings in preamble values', ->
        expect(parser.entries[0].entry).toBe("Maintained by Laurence Seeger.")
      )

      it('should concatenate strings in keyed entry field values', ->
        expect(parser.entries[1].entryTags['booktitle']).toBe("Planungsverband Ballungsraum Frankfurt-Rhein-Main (Hrsg.): Wissensatlas FrankfurtRheinMain: die Wissensregion stellt sich vor")
      )

      it('should concatenate string and variable values', ->
        expect(parser.entries[2].entryTags['keywords']).toBe("findability, {HUMAN}-computer interaction, {INFORMATION} architecture, {INFORMATION} overload, {INFORMATION}-seeking behavior, library users, {LIBRARY} websites, {WEB} design, website design")
      )
    )
