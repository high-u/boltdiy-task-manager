import fastify from 'fastify'
  import fs from 'fs'

  const app = fastify({ logger: true })

  let tasks = []
  const TASKS_FILE = './tasks.json'

  try {
    if (fs.existsSync(TASKS_FILE)) {
      tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'))
    }
  } catch (err) {
    console.error('Error reading tasks file:', err)
  }

  app.get('/api/tasks', async (request, reply) => {
    return tasks
  })

  app.get('/api/tasks/:id', async (request, reply) => {
    const task = tasks.find(t => t.id === parseInt(request.params.id))
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }
    return task
  })

  app.post('/api/tasks', async (request, reply) => {
    const { content } = request.body
    const newTask = {
      id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      content,
      completed: false,
      createdAt: new Date().toISOString()
    }
    tasks.push(newTask)
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))
    return reply.code(201).send(newTask)
  })

  app.put('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params
    const { completed } = request.body
    const taskIndex = tasks.findIndex(t => t.id === parseInt(id))
    if (taskIndex === -1) {
      return reply.code(404).send({ error: 'Task not found' })
    }
    tasks[taskIndex].completed = completed
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))
    return reply.send(tasks[taskIndex])
  })

  app.delete('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params
    const taskIndex = tasks.findIndex(t => t.id === parseInt(id))
    if (taskIndex === -1) {
      return reply.code(404).send({ error: 'Task not found' })
    }
    tasks.splice(taskIndex, 1)
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))
    return reply.send({ message: 'Task deleted successfully' })
  })

  app.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
