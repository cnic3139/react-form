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
	getValue(input, type) {
		let value = input;
		switch(type) {
			case 'text':
			case 'date':
				return input.childNodes[0].childNodes[1].value;
			case "radio":
				value = input.childNodes[0].childNodes;
				value = Array.prototype.slice.call(value).slice(1, value.length);
				value = value.map(v => v.childNodes[1]);
				value = value.map(v => [v.id, v.checked]);
				return value;
			case "checkbox":
				return input.childNodes[0].childNodes[1].childNodes[1].checked;
			case "array":
				value = input.childNodes[0].childNodes[1].childNodes;
				value = Array.prototype.slice.call(value).slice(0, value.length - 1);
				value = value.map(v => v.childNodes[0].childNodes[1]);
				value = value.map(v => v.value);
				return value;
			case "multipart":
				value = value.childNodes[0];
				value = Array.prototype.slice.call(value.childNodes).slice(1, value.length);
				value = value.map(v => v.childNodes[1]);
				value = value.map(v => [v.name, v.value]);
				return value;
			default:
				return input;
		}
	}

	// Validate the form agains the 'validations' properties in schema.
	validate(event) {
		event.preventDefault();

		let valid = true;

		const form = document.forms['form'];
		const formNodes = Array.prototype.slice.call(form.childNodes);
		valid = this.props.schema.fields.every(field => {
			const input = formNodes.find(node => node.id === field.id);

			// Check field is answered if mandatory
			if (!field.optional || typeof field.optional === 'object') {
				let optional;

				// Check type of 'optional' field.
				if (typeof field.optional === 'object') {

					// Resolve condition in 'optional' object.
					const dependentOn = formNodes.find(node => node.id === field.optional.dependentOn);
					const dependentOnValue = this.getValue(dependentOn, field.type);

					// Try and find a value in schema 'values' object that matches a value
					// given in 'dependentOn' input.
					// Otherwise, use the default value provided.
					const value = field.optional.values.find(val => dependentOnValue in val);

					if (value) {
						optional = value[dependentOnValue];
					} else {
						optional = field.optional.default;
					}

				} else {
					// Else 'optional' field is just a boolean value.
					optional = field.optional;
				}

				// If not optional, make sure input is answered.
				if (!optional) {
					return Boolean(this.getValue(input, field.type));
				}
			}

			return field.validations.every(validation => {
				if (validation.containsChar) {
					// Ensure input value has the specified char.
					return this.getValue(input, field.type).trim().includes(validation.containsChar);

				} else if (validation.dateGreaterThan) {
					// Ensure difference between today and given date is larger than specified interval.
					const value = this.getValue(input, field.type);

					let diff = Date.now() - new Date(value).getTime();

					// Convert from milliseconds to the unit given in schema.
					switch(validation.dateGreaterThan.unit) {
						case "seconds":
							diff = diff / 1000;
							break;
						case "minutes":
							diff = diff / 1000 / 60;
							break;
						case "hours":
							diff = diff / 1000 / 60 / 60;
							break;
						case "days":
							diff = diff / 1000 / 60 / 60 / 24;
							break;
						case "years":
							diff = diff / 1000 / 60 / 60 / 24 / 365;
							break;
						default:
							break;

						return diff > validation.dateGreaterThan.value;
					}
				}
			});
		});

		// If all checks pass, submit the form. Otherwise alert the user.
		if (valid) {
			this.submit();
		} else {
			alert("Form is not valid. Please make sure all inputs have been correctly answered.");
		}

	}

	// Submit the form.
	submit() {
		let outputData = {};
		// TODO make these common? i dunno
		const form = document.forms['form'];
		const formNodes = Array.prototype.slice.call(form.childNodes);
		this.props.schema.fields.forEach(field => {
			const input = formNodes.find(node => node.id === field.id);
			const inputValue = this.getValue(input, field.type);

			outputData[field.id] = inputValue;
		});

		// This is the output completed JSON form.
		console.log("final output: ", outputData);


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
						<span>{value.title}:</span>
						<input type="text" name={value.title} />
					</label>
				);

			case 'date':
				return (
					<label>
						<span>{value.title}:</span>
						<input type="date" name={value.title} />
					</label>
				);

			case 'number':
				return (
					<label>
						<span>{value.title}:</span>
						<input type="number" name={value.title} />
					</label>
				);

			case 'radio':
				return (
					<label>
						<span>{value.title}:</span>
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
						<span>{value.title}:</span>
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
						<span>{value.title}:</span>
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
					<label>
						<span>{value.title}:</span>
						<ArrayField 
							value={{
								...value,
								type: value.arrayOfType,
								title: null
							}} 
						/>
					</label>
				);
			
			default:
				return (
					<label>
						<span>{value.title}:</span>
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
		const elements = [...Array(this.state.size)].map((element, index) => (
			<li key={`li_${this.props.value.id}_${index}`}>
				<Field 
					key={this.props.value.id}
					value={this.props.value}
				/>
			</li>
		));

		return (
			<ol>
				{ elements }
				<button onClick={this.addNewInput}>Add new</button>
			</ol>
		);
	}
}

ReactDOM.render(
	<Form schema={schema.default} />,
	document.getElementById('root')
);
