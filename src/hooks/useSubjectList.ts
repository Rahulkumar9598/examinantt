import { useEffect, useState } from 'react';
import { DEFAULT_SUBJECTS, subjectService } from '../services/subjectService';

export const useSubjectList = () => {
    const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);

    useEffect(() => {
        const unsubscribe = subjectService.subscribe((records) => {
            if (records.length > 0) {
                setSubjects(records.map(record => record.name));
            } else {
                setSubjects(DEFAULT_SUBJECTS);
            }
        });

        return unsubscribe;
    }, []);

    return subjects;
};
