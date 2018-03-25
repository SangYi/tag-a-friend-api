const handleLogin = (db, bcrypt) => (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const usernameCheck = /^[a-zA-Z0-9]*$/i.test(usernameOrEmail);
  const emailCheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(usernameOrEmail);
  const loginMethod = usernameCheck 
    ? 'username' 
    : emailCheck 
      ? 'email'
      : ''
  if (!loginSelector || !password) {
    return res.status(400).json('incorrect form submission');
  }
  db.select(loginMethod, 'hash').from('login')
    .where(loginMethod, '=', usernameOrEmail)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where(loginChoice, '=', usernameOrEmail)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
  handleLogin
}