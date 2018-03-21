const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: 'c90c02fde6f247468c9090df3ec6a1f6'
});

const handleApiCall = (req, res) => {
  app.models
  .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
  .then(data => {
    res.json(data);
  })
  .catch(err => res.status(400).json('unable to work with API'))
}

module.exports = {
  handleApiCall
}