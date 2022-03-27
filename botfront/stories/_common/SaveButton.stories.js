import React from 'react';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import TranslatedSaveButton from '../../imports/ui/components/utils/SaveButton';

export default {
    title: '_basic/SaveButton',
    component: SaveButton,
    decorators: [withKnobs],
};

export const Basic = () => <TranslatedSaveButton />;
export const CustomText = () => (
    <TranslatedSaveButton saveText={text('Button text', 'Click to save')} />
);
export const WithProps = () => <SaveButton saving={boolean('Saving', false)} saved={boolean('Saved', false)} />;
