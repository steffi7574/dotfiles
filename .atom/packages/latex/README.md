# LaTeX package [![Build Status](https://travis-ci.org/thomasjo/atom-latex.svg?branch=master)](https://travis-ci.org/thomasjo/atom-latex)
Compile LaTeX documents from within Atom.

## Installing
Use the Atom package manager and search for "latex", or run `apm install latex`
from the command line.

## Prerequisites
### TeX distribution
Since this package relies upon either `latexmk` or `texify`, a reasonably up to
date and working TeX distribution is required. The only current officially
supported distributions are [TeX Live](https://www.tug.org/texlive/), and
[MiKTeX](http://miktex.org/). Although the latter is not as well tested and
supported as TeX Live, hence using TeX Live is highly recommended.

You need to ensure that the package can find your TeX distribution; if you're
using TeX Live and have installed to the default location then no further
action should be required. To help the package find the distribution's
binaries, you need to configure the *TeX Path* configuration variable to point
to the folder containing the binaries. This can be done either in the settings
view, or directly in your `config.cson` file.

## Usage
Invoke the `build` command by pressing the default keybind `ctrl-alt-b` while in
a `.tex` file.

### Magic comments
The package has support for the following Tex Magic comments
- `% !TEX root = ../file.tex` Select root file
- `% !TEX program = pdflatex` Select Latex Engine (pdflatex,lualatex,xelatex)

## Status
Please note that this package is in a **beta** state. Right now everything is
very naïve. As an example, there's no proper error and warning handling.

## TODO
Current wish list, in a semi-prioritized order.

- [ ] Build output.
  - [x] Error handling.
  - [ ] Warnings, and other non-critical messages.
- [ ] BibTeX autocompletion support.
- [ ] Add support for non-PDF typesetting (e.g. dvi).
- [ ] Project management.
  - [ ] Setting to override the output directory.
  - [ ] Setting to override the builder.

If you see something that's missing, or disagree with the prioritization,
consider submitting a [feature request](https://github.com/thomasjo/atom-latex/issues?labels=feature&state=open),
and if you're feeling super helpful, submit a pull request with an updated
TODO list :sparkling_heart:
