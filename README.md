# Henry

Simple JSON based Gantt chart created with NextJS

![image](https://user-images.githubusercontent.com/4241658/121113278-ba15e980-c84c-11eb-812c-e0e061d016eb.png)

Renders gantt chart with React from following format JSON

```json
{
    "project": "Awesome Project",
    "tasks": [
        {
            "id": "1",
            "assign": "Server",
            "title": "Awesome API",
            "start": "2021-05-27",
            "end": "2021-06-01"
        },
        {
            "id": "2",
            "assign": "Frontend",
            "title": "Cool Screen",
            "start": "2021-06-4",
            "end": "2021-06-09"
        },
        {
            "id": "3",
            "assign": "Client",
            "title": "Great Component",
            "start": "2021-05-27",
            "end": "2021-06-04"
        }
    ]
}
```
