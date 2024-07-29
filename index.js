const express = require('express')
const color = require('colors')
const cors = require('cors')

const app = express()
app.use(express.json());
app.use(express.static("dist"));


const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);
app.use(cors())


let notes = [
  {
    id: 1,
    content: "HTML es fácil",
    important: true,
  },
  {
    id: 2,
    content: "El browser solo puede ejecutar JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET y POST son los métodos más usados en el protocolo HTTP",
    important: false,
  },
  {
    id: 4,
    content: "Esta es una prueba de una aplicación fullstack!",
    important: false,
  },
  {
    id: 5,
    content: "Esta es una prueba de un frontend!",
    important: true,
  },
  {
    id: 6,
    content: "Esta es una prueba de un backend!",
    important: true,
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Servidor Node.js</h1>");
});

app.get("/api/notes", (request, response) => {
  response.json(notes);
});

app.get("/api/notes/:id", (request, response) => {
  console.log(
    "id:",
    // "\n---\n",
    // request,
    "\n---\n",
    request.params,
    "\n---\n",
    request.params.id,
    "\n---\n",
    typeof request.params.id,
    "\n---\n"
  );

  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);

  if (note) {
    response.json(note);
  } else {
    console.log(color.bgRed.white("XXXXX"));
    response.statusMessage=`Id: ${id} NO encontrado`
    response.status(404).end();
  }
});

const generateId = () => {
  const maxId = notes.length > 0 
  ? Math.max(...notes.map((n) => n.id)) 
  : 0;
  return maxId + 1;
};

app.post("/api/notes", (request, response) => {
  console.log(color.bgGreen.black('post body',request.body));
  
  const body = request.body;

  if (!body.content) {
    console.log(color.bgRed.white('sin datos en el request.body'));
    return response.status(400).json({
      error: "CONTENIDO PERDIDO. BODY EN BLANCO",
    });
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  };

  notes = notes.concat(note);
  console.log(color.bgCyan.black('post note nueva:',note));
  response.json(note);
});

app.put("/api/notes/:id", (request, response) => {
  console.log(color.bgGreen.black("put body", request.body));
  const body = request.body;

  if (!body.content) {
    console.log(color.bgRed.white("sin datos en el body"));
    return response.status(400).json({
      error: "CONTENIDO PERDIDO",
    });
  }

  const id = Number(request.params.id);

  const noteNew = {
    content: body.content,
    important: body.important || false,
    id: id,
  };

  const note = notes.find((note) => note.id === id);

  if (note) {
    notes = notes.map((note) => (note.id !== id ? note : noteNew));
    response.json(noteNew);
  } else {
    console.log(color.bgRed.white("XXXXX"));
    response.statusMessage = `Id: ${id} NO encontrado`;
    response.status(404).json({
      error: `Id: ${id} NO encontrado`,
    });
  }

});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);

  const note = notes.find((note) => note.id === id);

  if (note) {
    notes = notes.filter((note) => note.id !== id);
    console.log(color.bgBlue.white("delete note: ",note));
    response.status(200).json({ id: `Id: ${id} borrado` });
  } else {
    console.log(color.bgRed.white("XXXXX"));
    response.statusMessage = `Id: ${id} NO encontrado`;
    response.status(404).json({
      error: `Id: ${id} NO encontrado`,
    });
  }
    
});

app.patch("/api/notes/:id", (request, response) => {
  console.log(color.bgRed.black("patch body", request.body));
  const body = request.body;

  if (body?.content == undefined &&
      body?.important == undefined) {
        console.log(color.bgWhite.black("SIN DATOS COMPLETOS EN EL BODY"));
        return response.status(400).json({
          error: "CONTENIDO PERDIDO",
        });
  }

  const id = Number(request.params.id);
  
  const note = notes.find((note) => note.id === id);

  if (note) {

    noteOld = notes.filter((note) => note.id === id);

    let noteNew = {
      content: body?.content == undefined ? noteOld[0].content : body.content,
      important: body?.important == undefined ? noteOld[0].important : body.important,
      id : id,
    };

    notes = notes.map((note) => (note.id !== id ? note : noteNew));
    console.log(color.bgRed.black("patch noteOld", noteOld));
    console.log(color.bgRed.black("patch noteNew", noteNew));
    response.status(200).json(noteNew);
  } else {
    console.log(color.bgRed.white("XXXXX"));
    response.statusMessage = `Id: ${id} NO encontrado`;
    response.status(404).json({
      error: `Id: ${id} NO encontrado`,
    });
  }

});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'url desconocido' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})