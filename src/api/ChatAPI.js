// const API_KEY = process.env.REACT_APP_API_KEY;

// const PREFIX = "https://www.cleverbot.com/getreply";

// class ChatAPI {

//     /* Call back state for Cleverbot, needs to be passed back if set */
//     cs = null;

//     async getReply(input) {
//         /* Create base request */
//         let request = `${PREFIX}?key=${API_KEY}`;
        
//         /* Add control state if present */
//         if (input !== "") {

//             /* Add input from user */
//             request += `&input=${encodeURIComponent(input)}`;
//         }

//         if (this.cs !== null) {
//             request += `&cs=${this.cs}`;
//         }

//         const response = await fetch(request);
       
//         const json = await response.json();

//         /* Store control state */
//         this.cs = json.cs;

//         return json;
//     }
// }

// const singleton = new ChatAPI();

// export default singleton;