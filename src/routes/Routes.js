import DoingQuiz from "../pages/DoingQuiz";
import { Home } from "../pages/Home";
import QuizManager from "../pages/QuizManager";


const privateRoutes = [
    //  Example: {path: '/manager/home', layout: ManagerLayout , component: ManagerHome, authorization : ['Admin']}
    //  Explain:
    //  path: path from root
    //  layout: layout for this page (BlankLayout as default)
    //  component: component will be display
    //  authorization: array of roles can access this page
];
const publicRoutes = [
    {path: '/', component: Home},
    {path: '/question/manager', component: QuizManager},
    {path: '/question/doing', component: DoingQuiz}
];

export { publicRoutes, privateRoutes };
