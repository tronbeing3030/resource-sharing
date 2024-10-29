const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize the app and configure paths
const app = express();
const PORT = 3000;

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('uploads'));

// Database Setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'resources.db',
});

// Define Resource model
const Resource = sequelize.define('Resource', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Sync the database and create the table
sequelize.sync();

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.get('/sign-in', (req, res) => {
  res.render('sign-in');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, semester, branch, subject } = req.body;
    const fileName = req.file.filename;

    // Save resource in the database
    await Resource.create({
      title,
      fileName,
      semester,
      branch,
      subject,
    });

    res.redirect('/');
  } catch (error) {
    res.status(500).send('File upload failed.');
  }
});

app.get('/resources', async (req, res) => {
  const resources = await Resource.findAll();
  res.render('resources', { resources });
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  res.download(filePath);
});

// app.delete('/delete/:id', async (req, res) => {
//   try {
//     const resource = await Resource.findByPk(req.params.id);
//     if (resource) {
//       const filePath = path.join(uploadDir, resource.fileName);

//       // Delete file from filesystem
//       fs.unlink(filePath, (err) => {
//         if (err) console.error("Failed to delete file:", err);
//       });

//       // Delete resource from database
//       await resource.destroy();

//       res.json({ success: true });
//     } else {
//       res.status(404).json({ error: 'Resource not found' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to delete resource' });
//   }
// });


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
