import React from 'react';
import ReactDOM from 'react-dom';
import * as schema from './schema.json';
import './index.css'

// Form class representing entire form.
class Form extends React.Component {
	constructor(props) {
		super(props);

		// Bind 'this' to event handler method.
		this.validate = this.validate.bind(this);
	}

	// Map schema fields to elements to be inserted into the form.
	extractFields(fields) {
		return fields.map(field => (
			<div key={`div_${field.id}`} id={field.id}>
				<Field
					key={field.id}
					value={field}
				/>
			</div>
		));
	}

	// Get user inputted value out of HTML element.
	// TODO add case for radio input.
	getValue(input) {
		console.log('INPUT:', input);
		console.log('childNodes:', input.childNodes);
		const value = input.childNodes[0].childNodes[1];
		switch(value.type) {
			case 'text':
			case 'date':
				return value.value;
			case 'checkbox':
				return value.checked;
			case 'radio':
				console.log('RADIO INPUT:', input);
				console.log('RADIO VALUE:', value);
				return value;
			default:
					return value;
		}
	}

	// TODO
	// Validate the form agains the 'validations' properties in schema.
	validate(event) {
		event.preventDefault();

		let valid = true;

		const form = document.forms['form'];
		const formNodes = Array.prototype.slice.call(form.childNodes);
		this.props.schema.fields.every(field => {
			const input = formNodes.find(node => node.id === field.id);

			this.getValue(input);
			return true;
		});

	}

	// Submit the form.
	// TODO return json object with field data.
	submit() {
		document.getElementById('form_root').submit();
	}

	render() {
		const fields = this.extractFields(this.props.schema.fields);

		return (
			<form name="form" id="form_root">
				{ fields }
				<button onClick={this.validate}>Submit</button>
			</form>
		);
	}
}

// Field class representing a field inside the form.
class Field extends React.Component {
	render() {
		const value = this.props.value;

		// Switch on input type of the field.
		switch (this.props.value.type) {
			case 'text':
				return (
					<label>
						{value.title}
						<input type="text" name={value.title} />
					</label>
				);

			case 'date':
				return (
					<label>
						{value.title}
						<input type="date" name={value.title} />
					</label>
				);

			case 'number':
				return (
					<label>
						{value.title}
						<input type="number" name={value.title} />
					</label>
				);

			case 'radio':
				return (
					<label>
						{value.title}
						{value.options.map(option => (
							<label key={`radio_${option}`}>{option}
								<input type="radio" id={option} name={value.title} />
							</label>
						))}
					</label>
				);
			
			case 'checkbox':
				return (
					<label>
						{value.title}
						{value.options.map(option => (
							<label key={`checkbox_${option}`}>{option}
								<input type="checkbox" id={option} name={value.title} />
							</label>
						))}
					</label>
				);
			
			case 'multipart':
				return (
					<label>
						{value.title}
						{value.parts.map(part => (
							<Field 
								key={part.id}
								value={part}
							/>
						))}
					</label>
				);
			
			case 'array':
				return (
					// TODO
				);
			
			default:
				return (
					<label>
						{value.title}
						<input type="text" name={value.title} />
					</label>
				);
		}
	}
}

// Class representing a field of type 'array' 
// (i.e. multiple values can be provided) in the form.
class ArrayField extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			size: 1
		};

		this.addNewInput = this.addNewInput.bind(this);
	}

	// Add a new input field to the array field.
	addNewInput(event) {
		event.preventDefault();
		this.setState({
			size: this.state.size + 1
		});
	}

	render() {
		// TODO
	}
}

ReactDOM.render(
	<Form schema={schema.default} />,
	document.getElementById('root')
);
