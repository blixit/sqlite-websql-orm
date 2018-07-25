import { TaskInterface } from './Manager.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';

export class SwoWorker {

    static lastTaskId = 0;

    /**
     * A map to store the task of the current queue
     * @property queue
     */
    protected queue: Map<string, Array<TaskInterface>> = new Map<string, Array<TaskInterface>>() ;

    /**
     * A uniq identifyer to identify each task queue
     * @property currentTaskSetId
     */
    protected currentTaskSetId = '';


    /**
     * Add a task to the current queue
     * @param toAdd
     * @param type Ex : persist, merge, remove
     */
    addTask(toAdd: EntityInterface, type: string): SwoWorker {

        this.checkTaskSetId();

        this.queue[this.currentTaskSetId] = this.queue[this.currentTaskSetId] || [];

        if (toAdd.__hash__ === undefined ) {
            toAdd.__hash__ = SwoWorker.lastTaskId++;
            this.addToQueue(toAdd, type);
        } else {
            this.updateQueue(toAdd, type);
        }

        return this;
    }

    isScheduled(entity: EntityInterface): boolean {
        return entity.__hash__ !== undefined;
    }

    private addToQueue(toAdd: EntityInterface, type: string) {

        this.queue[this.currentTaskSetId].push(<TaskInterface>{
            entity: toAdd,
            type: type
        });

        return this;
    }

    private updateQueue(toAdd: EntityInterface, type: string) {
        for (const key in this.queue) {
            if (key) {
                const task = this.queue[key]
                .find(_task => _task.entity.__hash__ === toAdd.__hash__);
                if (task) {
                    task.entity = toAdd;
                    task.type = type;
                }
            }
        }

        return this;
    }

    /**
     * Gets the current queue
     */
    getCurrentQueue(): Array<TaskInterface> {
        return this.queue[this.currentTaskSetId] || [];
    }

    /**
     * Removes the currentTaskSetId from the queue
     * @param hash
     */
    resetQueue(hash: string): SwoWorker {
        delete this.queue[hash];
        return this;
    }

    /**
     * Ensures that currentTaskSetId is not empty
     */
    checkTaskSetId(): SwoWorker {

        if (this.currentTaskSetId.length === 0) {
            this.currentTaskSetId = this.guid();
        }

        return this;
    }

    /**
     * Gets currentTaskSetId
     */
    getCurrentTaskSetId(): string {
        return this.currentTaskSetId;
    }

    /**
     * Sets currentTaskSetId
     */
    setCurrentTaskSetId(id: string): SwoWorker {
        this.currentTaskSetId = id;

        return this;
    }

    /**
     * Generates an uniq string
     */
    private guid(): string {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}
