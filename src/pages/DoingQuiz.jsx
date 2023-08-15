import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import getUrl from "../services/APIGenerate"
import config from "../config.json"

export default function DoingQuiz() {
    const [question, setQuestion] = useState(null)
    const [reload, setReload] = useState(0)
    const [correct, setCorrect] = useState(0)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        axios.get(
            getUrl(config.server.api.question.random)
        ).then((response) => {
            if (response.status == 200) {
                setQuestion(response.data)
                console.log(response)
            }
        })
    }, [reload])

    return (
        <div className="container" style={{
            marginTop: "-4rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            gap: "1rem",
            height: "100vh"
        }}>
            <div style={{
                width: "fit-content",
                display: "flex",
                padding: "1rem",
                border: "1px solid"
            }}>
                <p style={{display: "inline-block"}}>
                    <span>Correct: </span>
                    <span>{correct}</span>
                    <span> /</span>
                    <span> {total}</span>
                    <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>
                    <span>Score: </span>
                    <span>{
                        total != 0 ? (correct / total * 10).toFixed(2) : 0
                    }
                    </span>
                </p>
            </div>
            {
                question != null ? <Quiz key={question.id} onNext={() => setReload(reload + 1)} 
                    onChecked={(isCorrect) => {
                        if (isCorrect) {
                            setCorrect(correct + 1)
                        }
                        setTotal(total + 1)
                    }}
                    question={question}/> : <></>
            }
        </div>
    )

}

function Quiz({ question, onNext, onChecked}) {
    const types = [
        {
            id: "one_choice",
            name: "Một đáp án"
        },
        {
            id: "multi_choice",
            name: "Nhiều đáp án"
        }
    ]

    const [questionState, setQuestionState] = useState(question)
    const [answers, setAnswers] = useState(question.answers)

    
    let rawAnswerList = JSON.parse(JSON.stringify(question)).answers
    let randomAnswerList = []
    let random = (min,max) => min + Math.floor(Math.random() * 10 ** (Math.log(max) / Math.log(10))) % (max - min + 1)
    while (rawAnswerList.length > 0) {
        let randomIndex = random(0, rawAnswerList.length - 1)
        randomAnswerList.push(
            {
                ...rawAnswerList[randomIndex]
            }
        )
        rawAnswerList.splice(randomIndex, 1)
    }
    const regex = /Cả [A-Z] và [A-Z]/
    for (let answer of rawAnswerList) {
        if (regex.test(answer.content)) {
            let value = regex.exec(answer.content)[0]
            let first = value.split(" ")[1].charAt(0) - 65
            let second = value.split(" ")[3].charAt(0) - 65
            let correctAnswer = "Cả "
            for (let answer2 of randomAnswerList) {
                if (answer2.id == question.answers[first]) {
                    correctAnswer = correctAnswer + answer2.ordinal
                }
            }
            correctAnswer = correctAnswer + " và "
            for (let answer2 of randomAnswerList) {
                if (answer2.id == question.answers[second]) {
                    correctAnswer = correctAnswer + answer2.ordinal
                }
            }
            answer.content = correctAnswer
        }
    }
    

    const [saveAnswers, setSaveAnsers] = useState(randomAnswerList.map((item, index) => {
        return {
            ...item,
            ordinal: String.fromCharCode(65 + index)
        }
    }))

    const [showAnswers, setShowAnswers] = useState(randomAnswerList.map((item, index) => {
        return {
            ...item,

            correct: false,
            ordinal: String.fromCharCode(65 + index)
        }
    }))

    let checkAnswer = () => {
        console.log("QUES")
        console.log(question.answers)
        console.log("SAVE")
        console.log(saveAnswers)
        console.log("SHOW")
        console.log(showAnswers)
        let isCorrect = true;
        for (let i = 0; i < saveAnswers.length; ++i) {
            if (saveAnswers[i].correct != showAnswers[i].correct) {
                isCorrect = false;
            }
        }

        if (isCorrect) {
            toast.success("Đúng")
            onChecked(true)
        } else {
            onChecked(false)
            let trueAnswer = "";
            for (let answer of saveAnswers) {
                if (answer.correct) {
                    trueAnswer = trueAnswer + answer.ordinal + ","
                }
            }
            if (trueAnswer[trueAnswer.length-1] == ",") {
                trueAnswer = trueAnswer.substring(0, trueAnswer.length - 1)
            }
            toast.error("Sai. Đáp án đúng là " + trueAnswer)
        }
        setTimeout(onNext, 4000)
    }

    return (
        <div key={question.id} className="main-question" style={{
            width: "50rem",
            maxWidth: "50rem", height: "fit-content", display: "flex",
            flexDirection: "column", gap: "10px", padding: "2rem",
            border: "1px solid"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div key={questionState.id} style={{flex: "1", marginRight: "1rem"}}>
                    <p>ID: {questionState.id}</p>
                    <p>{questionState.question}</p> 
                </div>
            </div>
            <div style={{
                marginTop: "10px",
                display: "flex", flexDirection: 'column', width: "100%", gap: "20px",
                justifyContent: "center"
            }}>
                {
                    showAnswers.map((item, index) => {
                        return (
                            <Answer onChange={(answer) => {
                                let newAnswers = [
                                    ...showAnswers.slice(0, index),
                                    answer,
                                    ...showAnswers.slice(index + 1)
                                ]
                                newAnswers = newAnswers.map((element) => {
                                    if (question.type == types[0].id) {
                                        return {
                                            ...element,
                                            correct: false
                                        }
                                    } else {
                                        return element
                                    }
                                })
                                setShowAnswers([
                                    ...newAnswers.slice(0, index),
                                    answer,
                                    ...newAnswers.slice(index + 1)
                                ])
                            }} key={item.id} index={index} answer={item} type={question.type} types={types}/>
                        )
                    })
                }
            </div>
            <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
            <button onClick={checkAnswer} style={{width: "5rem", padding: "0.3rem 1rem"}}>
                Gửi
            </button>
            </div>
        </div>
    )
}

function Answer({ type, types, answer, index, onChange }) {
    return (<div style={{ width: "100%", display: "flex", alignItems: "center", alignContent: "center" }}>
        {
            type == types[0].id ? <input onChange={(event) => onChange({
                ...answer,
                correct: !answer.correct
            })} name="answer" type="radio" style={{ marginRight: "1rem" }} /> :
            type == types[1].id ? <input
                    onChange={(event) => onChange({
                        ...answer,
                        correct: !answer.correct
                    })}
                    name="answer" type="checkbox" style={{ marginRight: "1rem" }} /> : <></>
        }
        <p style={{flex: "1", display: "flex"}}>
            <span>{answer.ordinal}</span>
            <span>. </span>
            <span>{answer.content}</span>
        </p>
    </div>)
}