import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins:[react()], server:{ proxy:{ '/api':{
  target:'http://127.0.0.1:8000',
  configure(proxy){
    proxy.on('error',(_error,_request,response)=>{
      if(response && !response.headersSent){
        response.writeHead(503,{'Content-Type':'application/json'})
        response.end(JSON.stringify({detail:'The enquiry service is currently unavailable. Please try again later.'}))
      }
    })
  }
} } } })
