import { render, fireEvent, screen } from '@testing-library/react';
import PrintOptionsModal, { THICKNESS_MULTIPLIER } from './PrintOptionsModal';

test('PrintOptionsModal calls onPrint with parsed options', () => {
  const onPrint = jest.fn();

  render(<PrintOptionsModal onClose={() => {}} onPrint={onPrint} />);

  fireEvent.click(screen.getByText('Print'));

  expect(onPrint).toHaveBeenCalledWith({
    type: 'wristband',
    layout: 4,
    width: 4,
    height: 2,
    playsPerPage: 12,
    includeTitle: true,
    includeNumber: true,
    thicknessMultiplier: THICKNESS_MULTIPLIER,
  });
});
