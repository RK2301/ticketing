import axios from "axios";

const buildClient = ({ req }) => {
    //we are on server
    if (typeof window === 'undefined')
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        })

    //we are on browser
    else
        return axios.create({
            baseURL: '/'
        })

}

export default buildClient