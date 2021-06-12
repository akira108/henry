# Henry

https://henry.vercel.app/

Simple JSON based Gantt chart created with NextJS

![image](https://user-images.githubusercontent.com/4241658/121763468-48ed7380-cb77-11eb-9e4a-faba22d77726.png)

Renders gantt chart with React from following format JSON

```json
{
    "project": "Awesome Project",
    "tasks": [
        {
            "id": "1",
            "assign": "Server",
            "title": "Awesome API",
            "start": "2021-05-27T15:00:00.000Z",
            "end": "2021-06-01T15:00:00.000Z",
            "progress": 80
        },
        {
            "id": "2",
            "assign": "Frontend",
            "title": "Cool Screen",
            "start": "2021-06-04T15:00:00.000Z",
            "end": "2021-06-09T15:00:00.000Z",
            "progress": 20
        },
        {
            "id": "3",
            "assign": "Client",
            "title": "Great Component",
            "start": "2021-05-27T15:00:00.000Z",
            "end": "2021-06-04T15:00:00.000Z",
            "progress": 0
        }
    ]
}
```
