import axios from "axios"
import { useEffect, useState } from "react"
import config from "../config.json"
import getUrl from "../services/APIGenerate"
import "./QuizManager.css"
import ContentEditable from "react-contenteditable"
import { get } from "react-hook-form"
import { toast } from "react-toastify"

export default function QuizManager() {

    const [questions, setQuestions] = useState([])
    const [reload, setReload] = useState(1)
    const [current, setCurrent] = useState(-1)
    const [previous, setPrevious] = useState(false)
    const [page, setPage] = useState(0)

    useEffect(() => {
        axios.get(
            getUrl(config.server.api.question.list) + `?page=${page}`
        ).then((response) => {
            console.log(response);
            setQuestions(response.data.map((item) => {
                if (item.type == null) {
                    item.type = "one_choice"
                }
                return item
            }))
            if (response.data.length > 0) {
                if (current == -1) {
                    setCurrent(0)
                } else if (previous) {
                    setCurrent(response.data.length - 1)
                }
            }
        }).catch(() => {})
    }, [reload])

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
            <div className="quiz-leftbar" style={{ flex: 1, padding: "1rem" }}>
                <QuizLeftBar question={questions} />
            </div>
            <div className="question" style={{
                flex: 4, display: "flex", height: "100%", alignItems: "center",
                position: "relative",
                top: "-5rem"
            }}>
                {
                    current != -1 ? <Quiz 
                    setPrevious={setPrevious}
                    setQuestion={(question) => {
                        setQuestions([
                            ...questions.slice(0, current),
                            question,
                            ...questions.slice(current + 1)
                        ])
                    }} 
                    onPreviousPage={() => {
                        setPage(page - 1 > 0 ? page - 1 : 0)
                        setReload(reload + 1)
                    }}
                    onNextPage={() => {
                        setPage(page + 1)
                        setReload(reload + 1)
                    }}
                    onPrevious={() => {
                        if (current - 1 >= 0) {
                            setCurrent(current - 1)
                        } else {
                            if (page - 1 >= 0) {
                                setPrevious(true)
                                setPage(page - 1)
                                setReload(reload + 1)
                            }
                        }
                    }}
                    onNext={() => {
                        if (current + 1 < questions.length) {
                            setCurrent(current + 1)
                        } else {
                            setPrevious(false)
                            setCurrent(0)
                            setPage(page + 1)
                            setReload(reload + 1)
                        }
                    }} isLast={current != questions.length - 1} setReload={setReload} question={questions[current]} /> : <></>
                }
            </div>

        </div>
    )
}

function Quiz({ setPrevious, setQuestion, question, setReload, onNext, onPrevious, onNextPage, onPreviousPage, isLast }) {
    console.log("QUES: ")
    console.log(question)
    console.log(Date.now() + " " + question.type)
    let questionType = question.type
    const [type, setType] = useState(questionType)
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
    console.log("STATE " + Date.now() + " " + type)

    const [answers, setAnswers] = useState(question.answers.map((item) => {
        return {
            ...item,
            isDelete: false
        }
    }))

    useEffect(() => {
        setAnswers(question.answers.map((item) => {
            return {
                ...item,
                isDelete: false
            }
        }))
    }, [question])

    let saveQuestion = () => {
        let saveAnswer = answers.filter((item) => !item.isDelete).map((item, index) => {
            return {
                content: item.content,
                isCorrect: item.correct,
                correct: item.correct
            }
        })
        let saveQuestion = {
            id: question.id,
            question: question.question,
            type: type,
            answers: saveAnswer
        }
        console.log(saveQuestion)
        axios.put(
            getUrl(config.server.api.question.update) + `?id=${saveQuestion.id}`,
            saveQuestion
        ).then((response) => {
            if (response.status == 200) {
                toast.success("Lưu thành công")
                setPrevious(false)
                onNext()
                // setReload(2)
            }
        })
    }

    return (
        <div className="main-question" style={{
            width: "50rem",
            maxWidth: "50rem", height: "fit-content", display: "flex",
            flexDirection: "column", gap: "10px", padding: "2rem",
            border: "1px solid"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div key={question.id} style={{flex: "1", marginRight: "1rem"}}>
                    <p>ID: {question.id}</p>
                    <ContentEditable 
                        style={{border: "none", outline: "none"}}
                        html={question.question} onChange={(event) => setQuestion({
                        ...question,
                        question: event.target.value
                    })}/>
                </div>
                <div>
                    <select value={type} onChange={(event) => {
                        console.log(event)
                        setType(event.target.value)
                    }}
                        name="type" id="" style={{ fontFamily: "Time New Roman", fontSize: "16px", padding: "5px" }}>
                        {
                            types.map((item, index) => {
                                return (
                                    <option key={index} value={item.id}>{item.name}</option>
                                )
                            })
                        }
                    </select>
                </div>
            </div>
            <div style={{
                marginTop: "10px",
                display: "flex", flexDirection: 'column', width: "100%", gap: "20px",
                justifyContent: "center"
            }}>
                {
                    answers.map((item, index) => {
                        return (
                            <Answer onChange={(answer) => {
                                console.log(answers)
                                let newAnswers = [
                                    ...answers.slice(0, index),
                                    answer,
                                    ...answers.slice(index + 1)
                                ]
                                newAnswers = newAnswers.map((element) => {
                                    console.log(type)
                                    if (type == types[0].id) {
                                        return {
                                            ...element,
                                            correct: false
                                        }
                                    } else {
                                        return element
                                    }
                                })
                                setAnswers([
                                    ...newAnswers.slice(0, index),
                                    answer,
                                    ...newAnswers.slice(index + 1)
                                ])
                            }} key={item.id} index={index} answer={item} type={type} types={types}/>
                        )
                    })
                }
            </div>
            <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
            <button onClick={saveQuestion} style={{width: "5rem", padding: "0.3rem 1rem"}}>
                Lưu
            </button>
            <button onClick={onPrevious} style={{width: "fit-content", padding: "0.3rem 1rem", whiteSpace: "nowrap"}}>
                Trước đó
            </button>
            <button
                onClick={onNext}
                style={{width: "fit-content", padding: "0.3rem 1rem", whiteSpace: "nowrap"}}>
                Tiếp theo
            </button>
            <button
                onClick={onPreviousPage}
                style={{width: "fit-content", padding: "0.3rem 1rem", whiteSpace: "nowrap"}}
            >
                Trang trước
            </button>
            <button
                onClick={onNextPage}
                style={{width: "fit-content", padding: "0.3rem 1rem", whiteSpace: "nowrap"}}
            >
                Trang sau
            </button>
            </div>
        </div>
    )
}

function Answer({ type, types, answer, index, onChange }) {
    console.log(type)
    return (<div style={{ width: "100%", display: "flex", alignItems: "center", alignContent: "center" }}>
        {
            type == types[0].id ? <input onChange={(event) => onChange({
                ...answer,
                correct: !answer.correct
            })} checked={answer.correct} value={answer.correct} disabled={answer.isDelete} name="answer" type="radio" style={{ marginRight: "1rem" }} /> :
            type == types[1].id ? <input checked={answer.correct} 
                    onChange={(event) => onChange({
                        ...answer,
                        correct: !answer.correct
                    })}
                    disabled={answer.isDelete} name="answer" type="checkbox" style={{ marginRight: "1rem" }} /> : <></>
        }
        <p style={{flex: "1", display: "flex"}}>
            <span disabled={answer.isDelete} style={{ color: answer.isDelete ? "gray" : "black"}}>{String.fromCharCode(65 + index)}</span>
            <span disabled={answer.isDelete} style={{color: answer.isDelete ? "gray" : "black"}}>. </span>
            <ContentEditable 
                        disabled={answer.isDelete}
                        style={{border: "none", outline: "none"}}
                        html={answer.content} 
                        onChange={(event) => onChange({
                            ...answer,
                            content: event.target.value
                        })}
            />
            {/* <input onChange={(event) => onChange({
                ...answer,
                content: event.target.value
            })} disabled={answer.isDelete} style={{
                marginRight: "1rem", flex: "1", border: "none", outline: "none", fontSize: "1rem",
                wordBreak: "break-word", flexWrap: "wrap", color: answer.isDelete ? "gray" : "black"}}
                value={answer.content}
            /> */}
        </p>
        <button onClick={(event) => {
            console.log(!answer.isDelete)
            onChange({
            ...answer,
            isDelete: !answer.isDelete
        })}} style={{ marginLeft: "auto", width: "5rem" }}>
            {answer.isDelete ? "Huỷ xoá" : "Xoá"}
        </button>
    </div>)
}

function QuizLeftBar({ question }) {
    const quizs = [
        { id: 1, question: "What is your name ?" },
        { id: 2, question: "How old are you ?" },
        { id: 3, question: "Where are you from ?" },
        { id: 4, question: "What are you doing for living ?" }
    ]
    return (
        <div className="quiz-leftbar" style={{height: "100%", display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {
                question.map((item, index) => {
                    return (
                        <div key={index}
                            style={{
                                padding: "1rem", margin: "0.5rem", border: "1px solid"
                            }}>
                            <p>{item.id}</p>
                            <p>{item.question}</p>
                        </div>
                    )
                })
            }
        </div>
    )
}