import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

// In prod, you need to change process.cwd() to __dirname and remove the second argument
const filePath = (fileName: string) =>
	path.join(process.cwd(), 'src/common/templates/email', fileName);

export const verificationEmailTemplate = (
	name: string,
	verificationLink: string,
) => {
	// Read the EJS file content
	const templateContent = fs.readFileSync(
		filePath('verification-email.ejs'),
		'utf8',
	);

	// Render the template with dynamic values
	return ejs.render(templateContent, { name, verificationLink });
};
