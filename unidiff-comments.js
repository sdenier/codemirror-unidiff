var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('myTextArea'), {
  readOnly: true,
  javascript: true,
  gutters: ['gutter-oldlines', 'gutter-newlines']
});

var comments = [];
comments[0] = ['First!', 'Second!'];

myCodeMirror.on('gutterClick', (cm, lnb, gutter, e) => {
  showCommentForm(cm, lnb);
});

function refresh() {
  var diff = computeDiff();
  displayUnidiffInCodeMirror(myCodeMirror, diff);
  displayPreviousComments(myCodeMirror);
}

refresh();

function computeDiff() {
  var text1 = document.getElementById('text1').value;
  var text2 = document.getElementById('text2').value;

  var dmp = new diff_match_patch();
  var lines = dmp.diff_linesToChars_(text1, text2);
  var diff = dmp.diff_main(lines.chars1, lines.chars2, false);
  dmp.diff_charsToLines_(diff, lines.lineArray);

  document.getElementById('diff').innerHTML = dmp.diff_prettyHtml(diff);
  return diff;
}

function displayUnidiffInCodeMirror(cm, diff) {
  var doc = cm.getDoc();

  diffLines = diff.map(d => {
    var lineByLine = d[1].split('\n').slice(0, -1);
    return lineByLine.map(l => [d[0], l]);
  }).reduce((a, b) => a.concat(b), []);

  console.log(diffLines)

  var text = diffLines.map(d => d[1]).join('\n');
  doc.setValue(text);

  var newLines = 0;
  var oldLines = 0;

  diffLines.forEach((line, lnb) => {
    var op = diffLines[lnb][0];
    if (op <= 0) {
      oldLines++;
      cm.setGutterMarker(lnb, 'gutter-oldlines',
        document.createTextNode(oldLines));
      if (op !== 0) {
        cm.addLineClass(lnb, 'background', 'deleted-lines');
      }
    }
    if (op >= 0) {
      newLines++;
      cm.setGutterMarker(lnb, 'gutter-newlines',
        document.createTextNode(newLines));
      if (op !== 0) {
        cm.addLineClass(lnb, 'background', 'added-lines');
      }
    }
  });
}

function showCommentForm(cm, lnb) {
  var elt = document.createElement('form');
  elt.innerHTML = '<textarea></textarea><input type="submit" value="Post"><input type="button" value="Cancel">';
  elt.classList.add('comment');
  var commentWidget = cm.addLineWidget(lnb, elt, {
    coverGutter: true
  });

  elt.querySelector('input[type="submit"]').addEventListener('click', e => {
    e.preventDefault();
    var commentText = elt.querySelector('textarea').value;
    postComment(cm, lnb, commentText);
    commentWidget.clear();
  });

  elt.querySelector('input[type="button"]').addEventListener('click', e => {
        // e.preventDefault();
        commentWidget.clear();
      });
}

function postComment(cm, lnb, commentText) {
  comments[lnb] = (comments[lnb] || [])
  comments[lnb].push(commentText);
  console.log(comments);
  displayComment(cm, lnb, commentText);
}

function displayComment(cm, lnb, comment) {
  var elt = document.createElement('div');
  elt.innerHTML = comment;
  elt.classList.add('comment');
  cm.addLineWidget(lnb, elt, {
    coverGutter: true
  });
}

function displayPreviousComments(cm) {
  comments.forEach((lineComments, i) => {
    lineComments.forEach(comment => {
      displayComment(cm, i, comment);
    });
  });
}

