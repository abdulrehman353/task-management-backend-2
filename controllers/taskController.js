const { Tasks, User } = require('../models');

exports.createTask = async (req, res) => {
  try {
    const { Title, Description, Status, Priority, DueDate, ProjectID, AssignedTo } = req.body;

    const newTask = await Tasks.create({
      Title,
      Description,
      Status,
      Priority,
      DueDate,
      ProjectID,
      AssignedTo,
      CreatedBy: req.user.UserID,
    });

    res.status(201).json({ message: 'Task created successfully!', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Tasks.findAll({
      include: [
        { model: User, as: 'Creator', attributes: ['UserID', 'Name', 'Email'] },
        { model: User, as: 'Assignee', attributes: ['UserID', 'Name', 'Email'] },
      ],
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Tasks.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.update(req.body);
    res.status(200).json({ message: 'Task updated successfully!', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Tasks.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    res.status(200).json({ message: 'Task deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};