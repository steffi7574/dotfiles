(function() {
  var DEBUG, byteLength, count, debug, debug_skip_file, fs, isfile, parseDebugLog, path, process, repeat;

  fs = require('fs');

  path = require('path');

  process = require('process');

  DEBUG = false;

  parseDebugLog = null;

  debug = function(str) {
    var e, homedir, logfilename;
    if (DEBUG) {
      if (!parseDebugLog) {
        try {
          homedir = process.env.HOME || process.env.USERPROFILE;
          logfilename = path.join(homedir, "parseTeXLog.out");
          parseDebugLog = fs.openSync(logfilename, 'w');
        } catch (_error) {
          e = _error;
          console.log("cannot open " + logfilename);
        }
      }
      return fs.writeSync(parseDebugLog, str + "\n");
    }
  };

  debug_skip_file = function(filename) {
    return true;
  };

  byteLength = function(str) {
    var code, i, s;
    s = str.length;
    i = s - 1;
    while (i >= 0) {
      code = str.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) {
        s++;
      } else if (code > 0x7ff && code <= 0xffff) {
        s += 2;
      }
      if (code >= 0xDC00 && code <= 0xDFFF) {
        i--;
      }
      i--;
    }
    return s;
  };

  count = function(array, target) {
    var ct, el, _i, _len;
    ct = 0;
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      el = array[_i];
      if (el === target) {
        ct++;
      }
    }
    return ct;
  };

  repeat = function(times, string) {
    var i, ret, _i;
    ret = "";
    for (i = _i = 1; 1 <= times ? _i <= times : _i >= times; i = 1 <= times ? ++_i : --_i) {
      ret += string;
    }
    return ret;
  };

  isfile = function(name) {
    var e, s;
    try {
      s = fs.statSync(name);
    } catch (_error) {
      e = _error;
      return false;
    }
    return s.isFile();
  };

  module.exports.parse_tex_log = function(data) {
    var STATE_NORMAL, STATE_REPORT_ERROR, STATE_REPORT_WARNING, STATE_SKIP, assignment_rx, comment_match, comment_rx, current_warning, e, emergency_stop, err_line, err_match, err_msg, err_text, errors, extend_line, extra, extralen, file_basic, file_extra, file_match, file_name, file_rx, file_useless1_rx, file_useless2_rx, file_useless_match, files, handle_warning, incomplete_if, l, line, line_num, line_rx, line_rx_latex_warn, linelen, location, log, log_iterator, log_next, log_next_extra, matched_parens_rx, ou_processing, pagenum_begin_match, pagenum_begin_rx, parsing, prev_line, print_debug, quotecount, recycle_extra, reprocess_extra, scanned_command, state, warning_match, warning_rx, warnings, xypic_begin_rx, xypic_flag, xypic_match, xypic_rx, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    errors = [];
    warnings = [];
    parsing = [];
    data = data.replace(/\r/g, '');
    log = (function() {
      var _i, _len, _ref, _results;
      _ref = data.split('\n');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        _results.push([l, byteLength(l)]);
      }
      return _results;
    })();
    log_iterator = log[Symbol.iterator]();
    file_basic = /\"?(?:[a-zA-Z]\:)?(?:\.|(?:\.\.\/)|(?:\.\.\\))*.+?\.[^\s\"\)\.]+\"?/;
    file_rx = /[^\(]*?\(("?(?:[a-zA-Z]\:)?(?:\.|(?:\.\.\/)|(?:\.\.\\))*.+?\.[^\s"\)\.]+"?)(\s|\"|\)|$)(.*)/;
    file_useless1_rx = /\{\"?(?:\.|\.\.\/)*[^\.]+\.[^\{\}]*\"?\}(.*)/;
    file_useless2_rx = /<\"?(?:\.|\.\.\/)*[^\.]+\.[^>]*\"?>(.*)/;
    pagenum_begin_rx = /\s*\[\d*(.*)/;
    line_rx = /^l\.(\d+)\s(.*)/;
    warning_rx = /^(.*?) Warning: (.+)/;
    line_rx_latex_warn = /input line (\d+)\.$/;
    matched_parens_rx = /\([^()]*\)/;
    assignment_rx = /\\[^=]*=/;
    xypic_begin_rx = /[^()]*?(?:not re)?loaded\)(.*)/;
    xypic_rx = /.*?(?:not re)?loaded\)(.*)/;
    comment_rx = /Excluding comment '.*?'(.*)/;
    files = [];
    xypic_flag = false;
    handle_warning = function(l) {
      var location, warn_line, warn_match_line;
      if (files === []) {
        location = "[no file]";
        parsing.push("PERR [handle_warning no files] " + l);
      } else {
        location = files[files.length - 1];
      }
      warn_match_line = line_rx_latex_warn.exec(l);
      if (warn_match_line) {
        warn_line = warn_match_line[1];
        return warnings.push([location, warn_line, l]);
      } else {
        return warnings.push([location, -1, l]);
      }
    };
    STATE_NORMAL = 0;
    STATE_SKIP = 1;
    STATE_REPORT_ERROR = 2;
    STATE_REPORT_WARNING = 3;
    state = STATE_NORMAL;
    line_num = 0;
    line = "";
    linelen = 0;
    recycle_extra = false;
    reprocess_extra = false;
    emergency_stop = false;
    incomplete_if = false;
    while (true) {
      if (recycle_extra) {
        _ref = [extra, extralen], line = _ref[0], linelen = _ref[1];
        recycle_extra = false;
        line_num += 1;
      } else if (reprocess_extra) {
        line = extra;
      } else {
        prev_line = line;
        try {
          log_next = log_iterator.next();
          _ref1 = log_next.value, line = _ref1[0], linelen = _ref1[1];
          line_num += 1;
        } catch (_error) {
          e = _error;
          break;
        }
      }
      if ((!reprocess_extra) && (line_num > 1) && (linelen >= 79) && (line[{
        0: 2
      }] !== "**")) {
        debug("Line " + line_num + " is " + line.length + " characters long; last char is " + line[line.length - 1]);
        extend_line = true;
        recycle_extra = false;
        file_match = file_rx.exec(line);
        if (file_match) {
          debug("MATCHED (long line)");
          file_name = file_match[1];
          file_extra = file_match[2] + file_match[3];
          quotecount = count(file_name, '\"');
          file_name = file_name.replace(/"/g, '');
          if (file_name.slice(-6) === "pdfTeX" && file_extra.slice(0, 8) === " warning") {
            debug("pdfTeX appended to file name, extending");
          } else if (file_extra !== ")" && file_extra !== "") {
            debug("additional text after file name, extending");
          } else if (quotecount === 1) {
            debug("only one quote, extending");
          } else if ((!isfile(file_name)) && debug_skip_file(file_name)) {
            debug("Not a file name");
          } else {
            debug("IT'S A (LONG) FILE NAME WITH NO EXTRA TEXT");
            extend_line = false;
          }
        }
        while (extend_line) {
          debug("extending: " + line);
          try {
            log_next_extra = log_iterator.next();
            _ref2 = log_next_extra.value, extra = _ref2[0], extralen = _ref2[1];
            debug("extension? " + extra);
            line_num += 1;
            if (extralen > 0 && (extra.slice(0, 5) === "File:" || extra.slice(0, 8) === "Package:" || extra.slice(0, 15) === "Document Class:") || (extra.slice(0, 9) === "LaTeX2e <") || extra.match(assignment_rx)) {
              debug("Found File: and friends, or LaTeX2e, or assignment_rx match");
              extend_line = false;
            } else if (line.slice(-3) === "...") {
              debug("Found [...]");
              extend_line = false;
              recycle_extra = true;
            } else {
              line += extra;
              debug("Extended: " + line);
              linelen += extralen;
              if (extralen < 79) {
                extend_line = false;
              }
            }
          } catch (_error) {
            e = _error;
            console.log("something wrong in extend line:");
            console.log(e);
            extend_line = false;
          }
        }
      }
      reprocess_extra = false;
      if (state === STATE_SKIP) {
        state = STATE_NORMAL;
        continue;
      }
      if (state === STATE_REPORT_ERROR) {
        debug("Reporting error in line: " + line);
        if (line.length > 0 && line.indexOf("! Emergency stop.") >= 0) {
          emergency_stop = true;
          debug("Emergency stop found");
          continue;
        }
        err_match = line_rx.exec(line);
        if (!err_match) {
          continue;
        }
        state = STATE_NORMAL;
        err_line = err_match[1];
        err_text = err_match[2];
        if (files === []) {
          location = "[no file]";
          parsing.push("PERR [STATE_REPORT_ERROR no files] " + line);
        } else {
          location = files[files.length - 1];
        }
        debug("Found error: " + err_msg);
        errors.push([location, err_line, err_msg, err_text]);
        continue;
      }
      if (state === STATE_REPORT_WARNING) {
        current_warning += line;
        if (line[line.length - 1] === '.') {
          handle_warning(current_warning);
          current_warning = null;
          state = STATE_NORMAL;
        }
        continue;
      }
      if (line === "") {
        continue;
      }
      if (line.length > 0 && line.trim().slice(0, 23) === "(\\end occurred when \\if" && line.trim().slice(-15) === "was incomplete)") {
        incomplete_if = true;
        debug(line);
      }
      if (line.length > 0 && (line.slice(0, 5) === "File:" || line.slice(0, 8) === "Package:" || line.slice(0, 15) === "Document Class:") || (line.slice(0, 9) === "LaTeX2e <")) {
        continue;
      }
      if (line.trim() === "Here is how much of TeX's memory you used:") {
        if (files.length > 0) {
          if (emergency_stop || incomplete_if) {
            debug("Done processing, files on stack due to known conditions (all is fine!)");
          } else if (xypic_flag) {
            parsing.push("PERR [files on stack (xypic)] " + files.join(';'));
          } else {
            parsing.push("PERR [files on stack] " + files.join(';'));
          }
          files = [];
        }
      }
      if (line.length > 0 && line.indexOf("! File ended while scanning use of") >= 0) {
        scanned_command = line.slice(35, -2);
        log_next = log_iterator.next();
        log_next = log_iterator.next();
        log_next = log_iterator.next();
        _ref3 = log_next.value, file_name = _ref3[0], linelen = _ref3[1];
        file_name = file_name.slice(3);
        errors.push([file_name, -1, "TeX STOPPED: " + line.slice(2, -2) + prev_line.slice(-5), ""]);
        continue;
      }
      if (line.length > 0 && line.indexOf("==> Fatal error occurred,") >= 0) {
        debug("Fatal error detected");
        if (errors === []) {
          errors.push(["", -1, "TeX STOPPED: fatal errors occurred. Check the TeX log file for details", ""]);
        }
        continue;
      }
      if (line.length > 0 && line.indexOf("! Emergency stop.") >= 0) {
        state = STATE_SKIP;
        emergency_stop = true;
        debug("Emergency stop found");
        continue;
      }
      if (line.length > 0 && line.indexOf("(That makes 100 errors; please try again.)") >= 0) {
        errors.push(["", -1, "Too many errors. TeX stopped.", ""]);
        debug("100 errors, stopping");
        break;
      }
      if (line.slice(0, 8) === "Overfull" || line.slice(0, 9) === "Underfull") {
        if (line.slice(-2) === "[]") {
          continue;
        }
        ou_processing = true;
        while (ou_processing) {
          try {
            log_next = log_iterator.next();
            _ref4 = log_next.value, line = _ref4[0], linelen = _ref4[1];
          } catch (_error) {
            debug("Over/underfull: StopIteration (" + line_num + ")");
            break;
          }
          line_num += 1;
          debug("Over/underfull: skip " + line + (" (" + line_num + ") "));
          if (line.length > 0 && line.slice(0, 3) === " []" || line.slice(0, 2) === "[]") {
            ou_processing = false;
          }
        }
        if (ou_processing) {
          warnings.push(["", -1, "Malformed LOG file: over/underfull"]);
          warnings.push(["", -1, "Please let me know via GitHub"]);
          break;
        } else {
          continue;
        }
      }
      if (line.length > 0 && line.slice(0, 2) === "**" && line.slice(-3) === "**)" && files && files.slice(-1)[0] && files.slice(-1)[0].indexOf("bibgerm") >= 0) {
        debug("special case: bibgerm");
        debug(repeat(files.length, " ") + files.slice(-1) + (" (" + line_num + ")"));
        files.pop();
        continue;
      }
      if (line.length > 0 && line.slice(0, 9) === "Examine \\" && line.slice(-3) === ". )" && files && files.slice(-1)[0] && files.slice(-1)[0].indexOf("relsize") >= 0) {
        debug("special case: relsize");
        debug(repeat(files.length, " ") + files.slice(-1)[0] + (" (" + line_num + ")"));
        files.pop();
        continue;
      }
      comment_match = comment_rx.exec(line);
      if (comment_match && files && files.slice(-1)[0] && files.slice(-1)[0].indexOf("comment") >= 0) {
        debug("special case: comment");
        extra = comment_match[1];
        debug("Reprocessing " + extra);
        reprocess_extra = true;
        continue;
      }
      if (line.length > 0 && line.trim() === "No configuration file `numprint.cfg' found.)" && files && files.slice(-1)[0] && files.slice(-1)[0].indexOf("numprint") >= 0) {
        debug("special case: numprint");
        debug(repeat(files.length, " ") + files.slice(-1)[0] + (" (" + line_num + ")"));
        files.pop();
        continue;
      }
      xypic_match = xypic_begin_rx.exec(line);
      if (xypic_match) {
        debug("xypic match before: " + line);
        if (files && files.slice(-1)[0] && files.slice(-1)[0].indexOf("xypic") >= 0) {
          debug(repeat(files.length, " ") + files.slice(-1)[0] + (" (" + line_num + ")"));
          files.pop();
          extra = xypic_match[1];
          debug("Reprocessing " + extra);
          reprocess_extra = true;
          continue;
        } else {
          debug("Found loaded) but top file name doesn't have xy");
        }
      }
      if (line.length > 0 && line.indexOf("pdfTeX warning (ext4): destination with the same identifier") >= 0) {
        handle_warning(line);
        continue;
      }
      line = line.trim();
      if (line.length > 0 && line[0] === ')') {
        if (files) {
          debug(repeat(files.length, " ") + files.slice(-1)[0] + (" (" + line_num + ")"));
          files.pop();
          extra = line.slice(1);
          debug("Reprocessing " + extra);
          reprocess_extra = true;
          continue;
        } else {
          parsing.push("PERR [')' no files]");
          break;
        }
      }
      pagenum_begin_match = pagenum_begin_rx.exec(line);
      if (pagenum_begin_match) {
        extra = pagenum_begin_match[1];
        debug("Reprocessing " + extra);
        reprocess_extra = true;
        continue;
      }
      if (line.length > 0 && ((_ref5 = line[0]) === ']' || _ref5 === '>')) {
        extra = line.slice(1);
        debug("Reprocessing " + extra);
        reprocess_extra = true;
        continue;
      }
      file_useless_match = file_useless1_rx.exec(line) || file_useless2_rx.exec(line);
      if (file_useless_match) {
        extra = file_useless_match[1];
        debug("Useless file: " + line);
        debug("Reprocessing " + extra);
        reprocess_extra = true;
        continue;
      }
      if (line.slice(0, 12) === "(pdftex.def)") {
        continue;
      }
      debug("FILE? Line:" + line);
      file_match = file_rx.exec(line);
      if (file_match) {
        debug("MATCHED");
        file_name = file_match[1];
        debug("with file name: " + file_name);
        extra = file_match[2] + file_match[3];
        debug("and extra: " + extra);
        file_name = file_name.replace(/"/g, "");
        if (file_name.slice(-6) === "pdfTeX" && extra.slice(0, 8) === " warning") {
          debug("pdfTeX appended to file name; removed");
          file_name = file_name.slice(-6);
          extra = "pdfTeX" + extra;
        }
        if ((!isfile(file_name)) && debug_skip_file(file_name)) {

        } else {
          debug("IT'S A FILE!");
          files.push(file_name);
          debug(repeat(files.length, " ") + files.slice(-1)[0] + (" (" + line_num + ")"));
          if ((!xypic_flag) && file_name.length > 0 && file_name.indexOf("xypic") >= 0) {
            xypic_flag = true;
            debug("xypic detected, demoting parsing error to warnings");
          }
          debug("Reprocessing " + extra);
          reprocess_extra = true;
          continue;
        }
      }
      xypic_match = xypic_rx.exec(line);
      if (xypic_match) {
        debug("xypic match after: " + line);
        if (files && files.slice(-1)[0] && files.slice(-1)[0].indexOf("xypic") >= 0) {
          debug(repeat(files.length, " ") + files.slice(-1)[0] + (" (%" + line_num + ")"));
          files.pop();
          extra = xypic_match[1];
          debug("Reprocessing " + extra);
          reprocess_extra = true;
          continue;
        } else {
          debug("Found loaded) but top file name doesn't have xy");
        }
      }
      if (line.length > 0 && line[0] === '!') {
        debug("Error found: " + line);
        if (line.indexOf("pdfTeX error") >= 0) {
          err_msg = line.slice(1).trim();
          errors.push(["", -1, err_msg, ""]);
          errors.push(["", -1, "Check the TeX log file for more information", ""]);
          continue;
        }
        err_msg = line.slice(2);
        state = STATE_REPORT_ERROR;
        continue;
      }
      pagenum_begin_match = pagenum_begin_rx.exec(line);
      if (pagenum_begin_match) {
        debug("Matching [xx after some text");
        extra = pagenum_begin_match[1];
        debug("Reprocessing " + extra);
        reprocess_extra = true;
        continue;
      }
      warning_match = warning_rx.exec(line);
      if (warning_match) {
        if (line[line.length - 1] === '.') {
          handle_warning(line);
          continue;
        }
        current_warning = line;
        state = STATE_REPORT_WARNING;
        continue;
      }
    }
    if (parsing.length > 0) {
      warnings.push(["", -1, "(Log parsing issues. Disregard unless something else is wrong.)"]);
      print_debug = true;
      for (_i = 0, _len = parsing.length; _i < _len; _i++) {
        l = parsing[_i];
        debug(l);
      }
    }
    if (DEBUG && parseDebugLog) {
      fs.closeSync(parseDebugLog);
      parseDebugLog = null;
    }
    return [errors, warnings];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL3BhcnNlcnMvcGFyc2UtdGV4LWxvZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFFQTtBQUFBLE1BQUEsa0dBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUixDQUZWLENBQUE7O0FBQUEsRUFRQSxLQUFBLEdBQVEsS0FSUixDQUFBOztBQUFBLEVBVUEsYUFBQSxHQUFnQixJQVZoQixDQUFBOztBQUFBLEVBWUEsS0FBQSxHQUFRLFNBQUMsR0FBRCxHQUFBO0FBQ04sUUFBQSx1QkFBQTtBQUFBLElBQUEsSUFBRyxLQUFIO0FBQ0UsTUFBQSxJQUFHLENBQUEsYUFBSDtBQUNFO0FBQ0UsVUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFaLElBQW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBMUMsQ0FBQTtBQUFBLFVBQ0EsV0FBQSxHQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixpQkFBbkIsQ0FEZCxDQUFBO0FBQUEsVUFFQSxhQUFBLEdBQWdCLEVBQUUsQ0FBQyxRQUFILENBQVksV0FBWixFQUF5QixHQUF6QixDQUZoQixDQURGO1NBQUEsY0FBQTtBQUtFLFVBREksVUFDSixDQUFBO0FBQUEsVUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQUEsR0FBaUIsV0FBN0IsQ0FBQSxDQUxGO1NBREY7T0FBQTthQU9BLEVBQUUsQ0FBQyxTQUFILENBQWEsYUFBYixFQUE0QixHQUFBLEdBQU0sSUFBbEMsRUFSRjtLQURNO0VBQUEsQ0FaUixDQUFB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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/parsers/parse-tex-log.coffee
