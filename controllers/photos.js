// NOT FINISHED
const handlePhoto = (req, res, db) => {
  const {imageUrl, faces} = req.body;
  //temp
  db('photos').insert({
    imageUrl
  })

  db.transaction(trx => {
      trx('login').insert({
          hash,
          email,
          username
      }, 'email')
      .then( ([loginEmail]) => {
          // console.log(loginEmail);
          return trx('account')
              .insert({
                  email: loginEmail,
                  name,
                  username,
                  created_on: new Date()
              }, '*')
              .then( ([user]) => {
                  // console.log(user)
                  res.json(user)
              })
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .catch(err => res.status(400).json({
      message: 'unable to register',
      err
  }))
}

module.exports = {
  handlePhoto
}