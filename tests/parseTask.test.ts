import { describe, expect, test } from '@jest/globals';
import { parseTask } from '../src/Parse/parsers';


describe('parse functions', () => {
    test('task parses correctly', () => {

        let parsedTask = parseTask('this is a task #TasK #test priority:: high 📅 2022-03-05 ✅ 2022-03-05');


        expect(parsedTask.tags[0]).toBe('TasK');
        expect(parsedTask.tagsNormalized[0]).toBe('task');
        expect(parsedTask.dueDate).toBe('2022-03-05');
        expect(parsedTask.doneDate).toBe('2022-03-05');
        expect(parsedTask.startDate).toBe(undefined);
        expect(parsedTask.createDate).toBe(undefined);
        expect(parsedTask.scheduledDate).toBe(undefined);
        expect(parsedTask.priority).toBe(1);

    });
});
