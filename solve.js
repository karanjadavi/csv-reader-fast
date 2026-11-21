const COMMA = 0, LB = 1, END = 2;

export function run(input) {
  const text = String(input.text);
  const header = input.header === true;
  const n = text.length;
  const errors = [];
  const rows = [];
  let columns = null;
  let width = -1;
  let pos = n > 0 && text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let line = 1;
  let recordLine = 1;
  let recordRow = null;
  let ended = END;
  let added = 0;

  function readUnq(value) {
    added = 0;
    for (;;) {
      let m = pos;
      while (m < n) {
        const c = text.charCodeAt(m);
        if (c === 44 || c === 10 || c === 13) break;
        m++;
      }
      if (m > pos) { value += text.slice(pos, m); added += m - pos; pos = m; }
      if (pos >= n) { ended = END; return value; }
      const c = text.charCodeAt(pos);
      if (c === 44) { pos++; ended = COMMA; return value; }
      if (c === 10) { pos++; line++; ended = LB; return value; }
      if (text.charCodeAt(pos + 1) === 10) { pos += 2; line++; ended = LB; return value; }
      errors.push({ code: 'stray_cr', line: recordLine, row: recordRow });
      pos++;
    }
  }

  function slowRecord() {
    const fields = [];
    let quoted;
    do {
      quoted = text.charCodeAt(pos) === 34;
      let value;
      if (quoted) {
        const open = pos, openLine = line;
        let j = pos + 1, seg = j, out = '', end = -1;
        for (;;) {
          const k = text.indexOf('"', j);
          if (k < 0) break;
          if (text.charCodeAt(k + 1) === 34) { out += text.slice(seg, k + 1); j = seg = k + 2; continue; }
          out += text.slice(seg, k); end = k + 1; break;
        }
        if (end < 0) {
          pos = open + 1; line = openLine;
          errors.push({ code: 'unterminated_quote', line: recordLine, row: recordRow });
          value = readUnq('"');
        } else {
          if (out.indexOf('\r') >= 0) out = out.replace(/\r\n?/g, '\n');
          for (let p = out.indexOf('\n'); p >= 0; p = out.indexOf('\n', p + 1)) line++;
          pos = end;
          if (pos >= n) { value = out; ended = END; }
          else {
            const c = text.charCodeAt(pos);
            if (c === 44) { pos++; value = out; ended = COMMA; }
            else if (c === 10) { pos++; line++; value = out; ended = LB; }
            else if (c === 13 && text.charCodeAt(pos + 1) === 10) { pos += 2; line++; value = out; ended = LB; }
            else {
              value = readUnq(out);
              if (added > 0) errors.push({ code: 'quote_junk', line: recordLine, row: recordRow });
            }
          }
        }
      } else value = readUnq('');
      fields.push(value);
    } while (ended === COMMA);
    if (fields.length === 1 && fields[0] === '' && !quoted) return null;
    return fields;
  }

  let nextQ = text.indexOf('"', pos);
  let nextCR = text.indexOf('\r', pos);

  for (;;) {
    while (pos < n) {
      const c = text.charCodeAt(pos);
      if (c === 10) { pos++; line++; }
      else if (c === 13 && text.charCodeAt(pos + 1) === 10) { pos += 2; line++; }
      else break;
    }
    if (pos >= n) break;
    recordLine = line;
    recordRow = header && columns === null ? null : rows.length;
    if (nextQ !== -1 && nextQ < pos) nextQ = text.indexOf('"', pos);
    if (nextCR !== -1 && nextCR < pos) nextCR = text.indexOf('\r', pos);
    const nl = text.indexOf('\n', pos);
    let fields;
    if (nextQ === -1 || (nl !== -1 && nextQ > nl)) {
      if (nextCR === -1 || (nl !== -1 && nextCR > nl)) {
        if (nl < 0) { fields = text.slice(pos).split(','); pos = n; }
        else { fields = text.slice(pos, nl).split(','); pos = nl + 1; }
        line++;
      } else if (nl !== -1 && nextCR === nl - 1) {
        fields = text.slice(pos, nl - 1).split(',');
        pos = nl + 1; line++;
      } else {
        fields = slowRecord();
        if (fields === null) continue;
      }
    } else {
      fields = slowRecord();
      if (fields === null) continue;
    }
    if (width < 0) width = fields.length;
    if (header && columns === null) { columns = fields; continue; }
    const len = fields.length;
    if (len < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: len });
      while (fields.length < width) fields.push('');
    } else if (len > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }
  return { columns: header ? (columns ?? []) : null, rows, errors };
}
export default run;
