
# WhatsApp WEB JS API

This is a WhatsApp bot built with nodejs  Express that connects through the WhatsApp Web browser app and uses the [WhatsApp Web](https://wwebjs.dev/) client library for the WhatsApp Web API.

## Features

- Suport multiple akun
- Send text messages single or multiple simultaneously via API.
- Send file messages with or without captions simultaneously via API.
- Delete akun by Account ID or number your register

## Usage

1. Clone the repository using `git clone https://github.com/Ahmadsani31/Whatsapp-Web-API.git`.
2. Run `npm install` to install the dependencies.
3. Run `nodemon start` to start the bot.

The bot will display a QR code in the terminal. Scan this QR code with your phone to log in to WhatsApp Web and start using the bot.

## API Usage

You can only access with `Authorization` - `BASIC_AUTH`, you can set username dan password in .env for BASIC_AUTH


#### Init bot app

```bash
  GET http://localhost:3001/init-app
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accountId` | `string` | **Required**. the mobile number you will use or account ID |
| `Content-Type` | `form-data`  or `application/json` |

#### Send Message

```bash
  POST http://localhost:3000/send-message/:accountId
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accountId` | `string` | **Parameter**. *The id account you use or register*|
| `numbers` | `string` | **Required**. *Single or Multiples ID, separate with comma without space. Example: 6281152xxxxxx,6281266xxxxxx,*|
| `message` | `string` | **Required/Opsional**. *if you send file or image (.jpg,.jpeg,.png) you can skip this, if not This is mandatory*|
| `attachment` | `string` | **Opsional**. *Example:*`D:/example.jpg` |
| `caption` | `string` | *Opsional*.  |
| `Content-Type` | `application/json` | 


#### Send File

```bash
  POST http://localhost:3000/delete
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accountId` | `string` | **Required**. *Number your register or account ID |
| `Content-Type` | `form-data`  or `application/json` |


## Doc

See more details here 
https://docs.wwebjs.dev/

## Contributing

Contributions are always welcome! Please Fork this repository.

## License
MIT.
