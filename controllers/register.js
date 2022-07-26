
const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    // check if input fields are empty
    if (!email || !name || !password) {
      return res.status(400).json('incorrect form submission');
    }
    const hash = bcrypt.hashSync(password);
      db.transaction(trx => {
        trx.insert({
          hash: hash,
          email: email 
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
          return trx('users')
            .returning('*') 
            .insert({
              email: loginEmail[0].email, 
              name: name,
              joined: new Date()
            })
            .then(user => {
              res.json(user[0]);  
            })
        })
        .then(trx.commit) // add new user info into login and users table
        .catch(trx.rollback)
      })
      .catch(err => res.status(400).json('unable to register'))
  }

module.exports = {
    handleRegister: handleRegister
}