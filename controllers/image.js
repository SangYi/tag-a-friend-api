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
  //returns a promise
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
const getPhotos = (db) => (req, res) => {
  const {userId} = req.params;

  db('photos')
  .select('photos.url', 'photos.photo_id','faces.*')
  .innerJoin('faces', 'photos.photo_id', 'faces.photo_id')
  .where('user_id', userId)
  .then(photosRes => {
    console.log(photosRes.length)
    const photos = photosRes.reduce((acc, curr) => {
      const {
        url,
        photo_id,
        face_id,
        topframe,
        rightframe,
        bottomframe,
        leftframe,
        name
      } = curr;
      
      const photoIndex = acc.map(photo => photo.photo_id).indexOf(photo_id)
      if(photoIndex >= 0) {
        acc[photoIndex].faces.push({
          face_id,
          topframe,
          bottomframe,
          rightframe,
          leftframe,
          name
        })
      } else {
        acc.push({
          url,
          photo_id,
          faces : [{
            face_id,
            topframe,
            bottomframe,
            rightframe,
            leftframe,
            name
          }]
        })
      }
      return acc
    },[])
    res.json(photos)
  })
  .catch(err => res.status(400).json('unable to get photos'))
}

const handleImageSubmit = (db) => (req, res) => {
  const {user_id, imageUrl} = req.body;
  
  getFaceLocations(imageUrl)
  .then( data => {
    db.transaction(trx => {
      trx('photos').insert({
        user_id,
        url: imageUrl
      }, 'photo_id')
      .then( ([photo_id]) => {
        const faceLocations = data.map( face => Object.assign(face,{photo_id}))
        return trx('faces')
          .insert(faceLocations, '*')
          .then( faceArr => {
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

const handleEnterName = (db) => (req, res) => {
  const { faceId } = req.params;
  const { name } = req.body;
  db('faces')
    .where('face_id', '=', faceId, )
    .update('name', name, 'name')
    .then( ([name]) => {
      res.json({
        faceId,
        name
      });
    })
    .catch(err => res.status(400).json('unable to change name'))
}
module.exports = {
  handleApiCall,
  handleImageSubmit,
  getPhotos,
  handleEnterName,
}