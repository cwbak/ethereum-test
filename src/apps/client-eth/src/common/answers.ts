import { Answers } from "inquirer";

export function NormalizeAnswer(answers: Answers): Answers {
    for (const key in answers) {
        if (answers[key] == '') {
            answers[key] = null
        }
    }
    return answers
}
