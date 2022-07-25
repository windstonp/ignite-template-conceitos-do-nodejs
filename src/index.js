const express = require('express');
const cors = require('cors');


const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  if(!username){
    return response.status(404).json({
      error:"user not exists"
    })
  }
  const user = users.find((user)=> user.username === username);

  if(!user){
    return response.status(404).json({
      error:"user not exists"
    })
  }
  
  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userExists = users.find((user)=> user.username === username);
  if(userExists){
    return response.status(400).json({
      error: 'Mensagem do erro'
    })
  }
    const user = {
        id: v4(),
        name,
        username,
        todos: []
      };
  users.push(user);
  return response.status(200).json(users);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const todo = { 
    id: v4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;


  const todo = user.todos.find((todoItem)=>todoItem.id === id);
  

  if(!todo){
    return response.status(404).json({
      error: 'error'
    })
  }

  todo.title = title;
  todo.deadline = new Date(deadline);
  
  return response.json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const {id} = request.params;
  const todo = user.todos.find((todoItem)=>todoItem.id === id);
  if(!todo){
    return response.status(404).json({
      error: 'error'
    })
  }
  todo.done = true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const {id} = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex){
    return response.status(404).json({
      error: 'message'
    })
  }

  user.todos.splice(todoIndex, 1);
  return response.status(204);
});

module.exports = app;