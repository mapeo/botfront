
import Alert from 'react-s-alert';

export const runTestCaseStories = (projectId, options = {}) => {
    Meteor.call('stories.runTests', projectId, options, (error, response) => {
        if (error) {
            Alert.error(error.message);
        }
        const { passing, failing } = response;
        if (!failing) {
            Alert.success(`Teste completo. ${passing} passagem no teste${passing !== 1 ? 's' : ''}`, {
                position: 'top-right',
                timeout: 10 * 1000,
            });
        } else {
            Alert.error(`
                    Teste completo. ${passing} passagem no teste${passing !== 1 ? 's' : ''}, ${failing} teste${failing !== 1 ? 's' : ''} falha`,
            {
                position: 'top-right',
                timeout: 10 * 1000,
            });
        }
    });
};
