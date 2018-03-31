const handleRegister = (db, bcrypt) => (req, res) => {
  const {email, username, name, password} = req.body;
  
  const usernameCheck = /^[a-zA-Z0-9]*$/i.test(username);
  const emailCheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  
  if (!emailCheck || !usernameCheck || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password)
  //temp
  db.transaction(trx => {
      trx('logins').insert({
          hash,
          email,
          username
      }, 'email')
      .then( ([loginEmail]) => {
          console.log(loginEmail);
          return trx('users')
              .insert({
                  email: loginEmail,
                  name,
                  username,
                  created_on: new Date()
              }, '*')
              .then( ([user]) => {
                  console.log(user);
                  res.json(user);
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
  handleRegister
};