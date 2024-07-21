import App from "./app.js";

const PORT = process.env.PORT || 3000;

App.on('error',(error)=>{
    console.log("Server Error", error);
    throw new Error(error);
})

App.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}...  `);
})