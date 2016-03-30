{LTool,get_tex_root,find_in_files,is_file} = require './ltutils'
LTSelectListView = require './ltselectlist-view'
LTSelectList2View = require './ltselectlist2-view'
#get_ref_completions = require './get-ref-completions'
get_bib_completions = require './parsers/get-bib-completions'
path = require 'path'
fs = require 'fs'

module.exports =

class CompletionManager extends LTool
  sel_view: null
  sel2_view: null
  sel_panel: null

  constructor: (@ltconsole) ->
    super
    @sel_view = new LTSelectListView
    @sel2_view = new LTSelectList2View


  refCiteComplete: (te, keybinding = false) ->
    max_length = 100 # max length of ref/cite command, including backslash
    #ref_rx = /\\(?:eq|page|v|V|auto|name|c|C|cpage)?ref\{/
    ref_rx_rev = /^\{fer(?:qe|egap|v|V|otua|eman|c|C|egapc)?/
    #cite_rx = /\\cite[a-z\*]*?(?:\[.*?\]){0,2}\{/
    cite_rx_rev = /^([^{},]*)(?:,[^{},]*)*\{(?:\].*?\[){0,2}([a-zX*]*?)etic\\/

    current_point = te.getCursorBufferPosition()
    initial_point = [current_point.row, Math.max(0,current_point.column - max_length)]
    range = [initial_point, current_point]
    line = te.getTextInBufferRange(range)

    # This is JPS's awesome trick: reverse the line and match backward regexes!
    # JS/CS don't have string reverse, so instead go to array and reverse that

    line = line.split("").reverse().join("")

    # TODO: pass initial match to select list

    if (keybinding or atom.config.get("latextools.refAutoTrigger")) and
    m = ref_rx_rev.exec(line)
      console.log("found match")
      @refComplete(te)
    else if (keybinding or atom.config.get("latextools.citeAutoTrigger")) and
    m = cite_rx_rev.exec(line)
      console.log("found match")
      console.log(m)
      @citeComplete(te)

    # got_ref = false
    # te.backwardsScanInBufferRange ref_rx, range, ({match, stop}) =>
    #   console.log("found match")
    #   @refComplete(te)
    #   stop()
    #   got_ref = true
    #
    # return if got_ref
    #
    # got_cite = false
    # te.backwardsScanInBufferRange cite_rx, range, ({match, stop}) =>
    #   console.log("found match")
    #   console.log(match)
    #   @citeComplete(te)
    #   stop()
    #   got_cite = true
    #
    # return if got_cite



  refComplete: (te) ->

    fname = get_tex_root(te) # pass TextEditor, thanks to ig0777's patch

    parsed_fname = path.parse(fname)

    filedir = parsed_fname.dir
    filebase = parsed_fname.base  # name only includes the name (no dir, no ext)

    labels = find_in_files(filedir, filebase, /\\label\{([^\}]+)\}/g)

    # TODO add partially specified label to search field
    @sel_view.setItems(labels)
    @sel_view.start (item) =>
      te.insertText(item)
      # see if we need to skip a brace
      pt = te.getCursorBufferPosition()
      ran = [[pt.row, pt.column], [pt.row, pt.column+1]]
      if te.getTextInBufferRange(ran) == '}'
        te.moveRight()




  citeComplete: (te) ->

    fname = get_tex_root(te)

    parsed_fname = path.parse(fname)

    filedir = parsed_fname.dir
    filebase = parsed_fname.base  # name only includes the name (no dir, no ext)

    bib_rx = /\\(?:bibliography|nobibliography|addbibresource)\{([^\}]+)\}/g
    raw_bibs = find_in_files(filedir, filebase, bib_rx)

    # Split multiple bib files
    bibs = []
    for b in raw_bibs
      bibs = bibs.concat(b.split(','))

    # Trim and take care of .bib extension
    bibs = ((if path.extname(b) isnt '.bib' then path.join(filedir, b.trim()) + '.bib' else path.join(filedir, b.trim())) for b in bibs)

    # Check to see if they exist
    bibs = ( b for b in bibs when is_file(b) )

    if bibs.length == 0
      alert("Could not find bib files. Please check your \\bibliography statements")
      return

    # If it's a single string, put it in an array
    if typeof bibs == 'string'
      bibs = [bibs]

    bibentries = []
    for b in bibs
      [keywords, titles, authors, years, authors_short, titles_short, journals] = get_bib_completions(b)
      # TODO formatting here
      item_fmt = atom.config.get("latextools.citePanelFormat")

      if item_fmt.length != 2
        alert "Incorrect citePanelFormat specification. Check your preferences!"
        return

      # Inelegant but safe
      for i in [0...keywords.length]
        primary = item_fmt[0].replace("{keyword}", keywords[i])
          .replace("{title}", titles[i])
          .replace("{author}", authors[i])
          .replace("{year}", years[i])
          .replace("{author_short}", authors_short[i])
          .replace("{title_short}", titles_short[i])
          .replace("{journal}", journals[i])
        secondary = item_fmt[1].replace("{keyword}", keywords[i])
          .replace("{title}", titles[i])
          .replace("{author}", authors[i])
          .replace("{year}", years[i])
          .replace("{author_short}", authors_short[i])
          .replace("{title_short}", titles_short[i])
          .replace("{journal}", journals[i])
        bibentries.push( {"primary": primary, "secondary": secondary, "id": keywords[i]} )

    @sel2_view.setItems(bibentries)
    @sel2_view.start (item) =>
      te.insertText(item.id)
      # see if we need to skip a brace
      pt = te.getCursorBufferPosition()
      ran = [[pt.row, pt.column], [pt.row, pt.column+1]]
      if te.getTextInBufferRange(ran) == '}'
        te.moveRight()


  destroy: ->
    @sel2_view.destroy()
    @sel_view.destroy()
