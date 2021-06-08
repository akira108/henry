const Form = ({ text, onChange }) => {
    return (
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <label className="block">JSON</label>
        <textarea
          className="w-5/6 p-2 h-96 block border border-gray-300 rounded-lg font-mono"
          value={text}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            const val = e.target.value;
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            if (e.key === 'Tab') {
              e.preventDefault();
              e.target.value = val.substring(0, start) + ' '.repeat(4) + val.substring(end);
              e.target.selectionStart = e.target.selectionEnd = start + 1;
              return false;
            }
            if (e.key === 'Enter') {
              setTimeout((e) => {
                const val = e.target.value;
                const start = e.target.selectionStart;
                if (start > 1 && val[start - 1] != "\n") {
                  return;
                }
                let prevLine = "";
                let indent = 0;
                for (let i = start - 2; i >= 0 && val[i] != "\n"; i--) {
                  prevLine = val[i] + prevLine;
                }
                console.log('---');
                console.log(prevLine);
                console.log('---');
                for (let i = 0; i < prevLine.length && prevLine[i] === ' '; i++) {
                  indent++;
                }
                if (prevLine.includes('{') || prevLine.includes('[')) {
                  indent += 4;
                }
                e.target.value = val.substring(0, start) + ' '.repeat(indent) + val.substring(start);
                e.target.selectionStart = e.target.selectionEnd = start + indent;
              }, 0.01, e);
              return false;
            }
          }}
        />
      </form>
    );
  }
  
  export default Form;