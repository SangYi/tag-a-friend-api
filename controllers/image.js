const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: 'c90c02fde6f247468c9090df3ec6a1f6'
});

const handleApiCall = (req, res) => {
  const {imageUrl} = req.body;
  app.models
  .predict(Clarifai.FACE_DETECT_MODEL, imageUrl)
  .then(data => {
    res.json(data);
  })
  .catch(err => res.status(400).json('unable to work with API'))
}

const getFaceLocations = (url) => {
  return app.models
  .predict(Clarifai.FACE_DETECT_MODEL, url)
  .then(data => {
    if(data) {
      const clarifaiFaces = data.outputs[0].data.regions;

      return clarifaiFaces.map( clarifaiFace => {
        const {left_col, top_row, right_col, bottom_row} = clarifaiFace.region_info.bounding_box;
        return {
          leftframe: +(left_col * 100).toFixed(1),
          topframe: +(top_row * 100).toFixed(1),
          rightframe: +( right_col * 100).toFixed(1),
          bottomframe: +( bottom_row * 100).toFixed(1),
        };
      });
    } //End of if block
  })
};

const handleImageSubmit = (db) => (req, res) => {
  const {user_id, imageUrl} = req.body;
  
  getFaceLocations(input)
  .then( data => {
    db.transaction(trx => {
      trx('photos').insert({
        user_id,
        url: imageUrl
      }, 'photo_id')
    .then( ([photo_id]) => {
        console.log(photo_id)
        const faceLocations = data.map( x => Object.assign(x,{photo_id}))
        return trx('faces')
          .insert(faceLocations, '*')
          .then( faceArr => {
            console.log(faceArr);
            res.json(faceArr);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback);
    })
    .catch(err => res.status(400).json({
      message: 'unable to save photo',
      err
    }))
  })
  .catch(err => res.status(400).json('unable to work with Clarifai API'))
}

const handleEnterName = (req, res) => {
  res.json('changed name');
}
module.exports = {
  handleApiCall,
  handleImageSubmit,
  handleEnterName,
}