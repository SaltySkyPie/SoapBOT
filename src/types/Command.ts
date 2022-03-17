


export default class Command {
    id: number
    name: string
    description: string

    constructor(id: number, name: string, description: string) {
        [this.id, this.name, this.description] = [id, name, description];
    }
}