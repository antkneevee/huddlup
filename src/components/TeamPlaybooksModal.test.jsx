import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import TeamPlaybooksModal from './TeamPlaybooksModal';
import * as TeamsContext from '../context/TeamsContext.jsx';

jest.mock('../context/TeamsContext.jsx');
jest.mock('../firebase', () => ({ db: {}, auth: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(async () => ({ forEach: () => {} })),
}));

test('TeamPlaybooksModal saves selected playbooks', async () => {
  localStorage.setItem(
    'Playbook-1',
    JSON.stringify({ id: 'Playbook-1', name: 'PB1', playIds: [] })
  );
  const addPlaybookToTeam = jest.fn();
  const removePlaybookFromTeam = jest.fn();
  TeamsContext.useTeamsContext.mockReturnValue({
    addPlaybookToTeam,
    removePlaybookFromTeam,
  });

  const team = { id: 'team1', playbooks: [] };
  const onClose = jest.fn();
  render(<TeamPlaybooksModal team={team} onClose={onClose} />);

  const checkbox = await screen.findByLabelText('PB1');
  fireEvent.click(checkbox);
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => expect(addPlaybookToTeam).toHaveBeenCalledWith('team1', { id: 'Playbook-1' }));
  expect(onClose).toHaveBeenCalledWith(true);

  localStorage.clear();
});
