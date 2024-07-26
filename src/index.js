import App from "./App.js";
import { connectDB } from "./DB/index.js"
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
    App.on('error', (error) => {
        console.log("Server Error", error);
        throw new Error(error);
    })

    App.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...  `);
    })
}).catch((error) => console.log(error));