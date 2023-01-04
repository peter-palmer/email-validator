const nodemailer = require('nodemailer');
const dns = require('dns');
const express = require('express');
const app = express();
const port = 3000;

app.get('/verify-email', (req, res) => {
  const email = req.query.email;
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isValidFormat = emailRegex.test(email);

  if (!isValidFormat) {
    return res.send({
      email,
      isValid: false,
    });
  }

  const domain = email.split('@')[1];
  dns.resolve(domain, (err) => {
    if (err) {
      return res.send({
        email,
        isValid: false,
      });
    }

    // Si llegamos hasta aquí, es que el formato es válido y el dominio existe
    // Ahora vamos a hacer una conexión al servidor de correo y enviar un mensaje

    const transporter = nodemailer.createTransport({
      host: `smtp.${domain}`,
      port: 587,
      secure: false,
      requireTLS: true,
    });

    const message = {
      from: 'verification@yourdomain.com',
      to: email,
      subject: 'Verificación de correo',
      text: 'Este es un mensaje de verificación',
    };

    transporter.sendMail(message, (sendErr) => {
      if (sendErr) {
        return res.send({
          email,
          isValid: false,
        });
      }

      // Si llegamos hasta aquí, es que el correo se envió correctamente
      res.send({
        email,
        isValid: true,
      });
    });
  });
});
