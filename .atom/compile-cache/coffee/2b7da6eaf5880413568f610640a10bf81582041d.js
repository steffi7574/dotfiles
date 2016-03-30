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
          emergency_stop = True;
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
      warnings(["", -1, "(Log parsing issues. Disregard unless something else is wrong.)"]);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL3BhcnNlcnMvcGFyc2VUZXhMb2cuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBRUE7QUFBQSxNQUFBLGtHQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FGVixDQUFBOztBQUFBLEVBUUEsS0FBQSxHQUFRLEtBUlIsQ0FBQTs7QUFBQSxFQVVBLGFBQUEsR0FBZ0IsSUFWaEIsQ0FBQTs7QUFBQSxFQVlBLEtBQUEsR0FBUSxTQUFDLEdBQUQsR0FBQTtBQUNOLFFBQUEsdUJBQUE7QUFBQSxJQUFBLElBQUcsS0FBSDtBQUNFLE1BQUEsSUFBRyxDQUFBLGFBQUg7QUFDRTtBQUNFLFVBQUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBWixJQUFvQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQTFDLENBQUE7QUFBQSxVQUNBLFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsaUJBQW5CLENBRGQsQ0FBQTtBQUFBLFVBRUEsYUFBQSxHQUFnQixFQUFFLENBQUMsUUFBSCxDQUFZLFdBQVosRUFBeUIsR0FBekIsQ0FGaEIsQ0FERjtTQUFBLGNBQUE7QUFLRSxVQURJLFVBQ0osQ0FBQTtBQUFBLFVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFBLEdBQWlCLFdBQTdCLENBQUEsQ0FMRjtTQURGO09BQUE7YUFPQSxFQUFFLENBQUMsU0FBSCxDQUFhLGFBQWIsRUFBNEIsR0FBQSxHQUFNLElBQWxDLEVBUkY7S0FETTtFQUFBLENBWlIsQ0FBQTs7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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/parsers/parseTexLog.coffee
