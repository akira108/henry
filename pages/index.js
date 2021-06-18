import Head from 'next/head'
import { useState, useRef, forwardRef, useEffect } from 'react'
import DomToImage from 'dom-to-image'

import Form from '../components/form'
import Gantt from '../components/gantt'
import { parseJsonDate } from '../utils/utils'
import { compareAsc } from 'date-fns'

export default function Home() {
  const [text, setText] = useState();
  const [json, setJson] = useState();
  const [errors, setErrors] = useState([]);
  const [imageUrl, setImageUrl] = useState();
  const ref = useRef(null);
  const onTextChange = (text) => {
    setText(text);
    setImageUrl(null);
    const { json: newJson, errors } = validateJson(text);
    if (newJson) {
      setJson(newJson);
    }
    setErrors(errors);
  }
  useEffect(() => {
    const storedJson = validateJson(localStorage.getItem('json')).json || sample
    setText(JSON.stringify(storedJson, null, 4))
    setJson(storedJson)
  }, [])
  useEffect(() => {
    if (json) {
      localStorage.setItem('json', JSON.stringify(json))
    }
  }, [json])
  return (<>
    <Head>
      <title>{json?.project ? `Henry - ${json.project}` : 'Henry'}</title>
    </Head>
    {json &&
      <div className="m-5">
        {json.project && <h1 className="text-3xl font-bold my-3">{json.project}</h1>}
        <div className="overflow-x-scroll">
          <Gantt json={json} setJson={(updatedJson) => {
            setText(JSON.stringify(updatedJson, null, 4))
            setJson(updatedJson)
          }} ref={ref} />
        </div>
        <div>
          <button className="my-1 bg-gradient-to-r from-pink-300 to-purple-300 hover:from-pink-300 hover:to-purple-400 text-white font-semibold py-1 px-3 border border-gray-200 rounded shadow"
            onClick={() => {
              const sorted = [...json.tasks].sort((a, b) => compareAsc(a.start, b.start))
              const sortedById = sorted.map(t => parseInt(t.id, 10)).sort((a, b) => a < b);
              const lastId = sortedById[0];
              const tasks = [...sorted,
              {
                id: `${lastId + 1}`,
                title: 'New Task',
                assign: sorted[sorted.length - 1].assign,
                start: sorted[sorted.length - 1].start,
                end: sorted[sorted.length - 1].end,
                progress: 0
              }]
              setJson({ ...json, tasks: tasks })
            }}
          >+</button>
        </div>
        <ImageCapture ref={ref} imageUrl={imageUrl} setImageUrl={setImageUrl} />
        <Form text={text} setText={setText} onChange={onTextChange} />
        <div className="mt-2">
          {errors.map((error) => <p key={error} className="text-red-400">{error}</p>)}
        </div>
        <p className="text-gray-200">{JSON.stringify(json)}</p>
      </div>
    }
  </>
  );
}

const ImageCapture = forwardRef(({ imageUrl, setImageUrl }, ref) => {
  return (
    <div>
      <button className="my-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-200 rounded shadow"
        onClick={async () => {
          try {
            const scale = 2;
            setImageUrl(await DomToImage.toPng(ref.current, {
              height: ref.current.offsetHeight * scale,
              style: {
                transform: `scale(${scale}) translate(${ref.current.offsetWidth / 2 / scale}px, ${ref.current.offsetHeight / 2 / scale}px)`
              },
              width: ref.current.offsetWidth * scale
            }));
          } catch (e) {
            console.error(e);
          }
        }}>Get PNG</button>
      {
        imageUrl ? <div className="my-3 p-4 border border-gray-200 w-5/6 rounded">
          <p className="text-gray-800">You can right-click below image and copy-paste or download</p>
          <img src={imageUrl} />
        </div> : null
      }
    </div>
  );
});

const validateJson = (text) => {
  if (!text) {
    return { json: null, errors: ['empty'] };
  }
  try {
    const parsed = JSON.parse(text, (k, v) => {
      if (k === 'start' || k === 'end') {
        const date = parseJsonDate(v);
        if (isNaN(date)) {
          throw SyntaxError(`invalid date. Please specify as ISO format: ${k} ${v}`);
        } else {
          return date;
        }
      } else {
        return v;
      }
    });
    if (!parsed.tasks) { return { json: null, errors: ['array "tasks" is missing'] }; } else {
      let errors = [];
      for (let i = 0; i < parsed.tasks.length; i++) {
        const elm = parsed.tasks[i];
        if (!elm.id) {
          errors.push(`field "id" is missing at index ${i}`);
        }
        if (!elm.assign) {
          errors.push(`field "assign" is missing at index ${i}`);
        }
        if (!elm.title) {
          errors.push(`field "title" is missing at index ${i}`);
        }
        if (!elm.start) {
          errors.push(`field "start" is missing at index ${i}`);
        }
        if (!elm.end) {
          errors.push(`field "end" is missing at index ${i}`);
        }
      }
      if (errors.length === 0) {
        return { json: parsed, errors: [] }
      } else { return { json: null, errors: errors }; }
    }
  } catch (e) {
    return { json: null, errors: [`${e}`] }
  }
}

const sample = {
  "project": "Awesome Project",
  "tasks": [
    {
      "id": "1",
      "assign": "Server",
      "title": "Awesome API",
      "start": parseJsonDate("2021-05-27T15:00:00.000Z"),
      "end": parseJsonDate("2021-06-01T15:00:00.000Z"),
      "progress": 80
    },
    {
      "id": "2",
      "assign": "Frontend",
      "title": "Cool Screen",
      "start": parseJsonDate("2021-06-04T15:00:00.000Z"),
      "end": parseJsonDate("2021-06-09T15:00:00.000Z"),
      "progress": 20
    },
    {
      "id": "3",
      "assign": "Client",
      "title": "Great Component",
      "start": parseJsonDate("2021-05-27T15:00:00.000Z"),
      "end": parseJsonDate("2021-06-04T15:00:00.000Z"),
      "progress": 0
    }
  ]
}