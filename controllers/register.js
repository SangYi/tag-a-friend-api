const handleRegister = (db, bcrypt) => (req, res) => {
  const {email, username, name, password} = req.body;
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
                  console.log(user)
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

// const handleRegister = (req, res, db, bcrypt) => {
//   const { email, username, name, password } = req.body;
//   const usernameCheck = /^[a-zA-Z0-9]*$/i.test(username);
//   const emailCheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  
//   if (!emailCheck || !usernameCheck || !name || !password) {
//     return res.status(400).json('incorrect form submission');
//   }
//   const hash = bcrypt.hashSync(password);
//     db.transaction(trx => {
//       trx.insert({
//         hash: hash,
//         email: email,
//         username: username,
//       })
//       .into('login')
//       .returning('email')
//       .then(loginEmail => {
//         return trx('users')
//           .returning('*')
//           .insert({
//             email: loginEmail[0],
//             name: name,
//             username: username,
//             joined: new Date()
//           })
//           .then(user => {
//             res.json(user[0]);
//           })
//       })
//       .then(trx.commit)
//       .catch(trx.rollback)
//     })
//     .catch(err => res.status(400).json('unable to register'))
// }

module.exports = {
  handleRegister: handleRegister
};