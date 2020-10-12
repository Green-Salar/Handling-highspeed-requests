export default class Util{
    static generateUuid() {
        return Math.random().toString() +
            Math.random().toString() +
            Math.random().toString();
    }

}