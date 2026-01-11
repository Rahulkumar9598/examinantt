#!/usr/bin/env python3
"""
Comprehensive JEE Mains Seed Data Generator
Generates chapters and sample questions for Physics, Chemistry, and Mathematics
"""

import json

def main():
    seed_data = {
        "chapters": [],
        "questions": []
    }
    
    # Physics Chapters - Class 11
    physics_11 = [
        {"name": "Physical World and Measurement", "unit": "Class 11 - Unit 1", "description": "Introduction to physics, scope and excitement of physics, nature of physical laws. Units and measurements including SI units, dimensional analysis.", "topics": ["Scope of Physics", "Units and Dimensions", "Dimensional Analysis", "Significant Figures", "Errors in Measurement"], "difficulty": "Easy"},
        {"name": "Kinematics", "unit": "Class 11 - Unit 2", "description": "Motion in straight line and plane, projectile and circular motion. Position, displacement, velocity, acceleration concepts.", "topics": ["Motion in Straight Line", "Motion in Plane", "Projectile Motion", "Circular Motion", "Relative Velocity"], "difficulty": "Medium"},
        {"name": "Laws of Motion", "unit": "Class 11 - Unit 3", "description": "Newton's laws of motion, inertia, momentum, impulse, conservation of momentum. Force, equilibrium, friction.", "topics": ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Conservation of Momentum", "Friction", "Circular Motion Dynamics"], "difficulty": "Medium"},
        {"name": "Work, Energy and Power", "unit": "Class 11 - Unit 4", "description": "Work by constant and variable forces, kinetic and potential energy, work-energy theorem, conservation of energy, collisions.", "topics": ["Work Done", "Kinetic Energy", "Potential Energy", "Work-Energy Theorem", "Power", "Conservation of Energy", "Collisions"], "difficulty": "Medium"},
        {"name": "Motion of System of Particles and Rigid Body", "unit": "Class 11 - Unit 5", "description": "Center of mass, momentum conservation, rigid body rotation, moment of inertia, torque, angular momentum.", "topics": ["Center of Mass", "Linear Momentum", "Rotational Motion", "Moment of Inertia", "Torque", "Angular Momentum"], "difficulty": "Hard"},
        {"name": "Gravitation", "unit": "Class 11 - Unit 6", "description": "Universal law of gravitation, gravitational potential energy, escape velocity, satellite motion, Kepler's laws.", "topics": ["Universal Law of Gravitation", "Acceleration due to Gravity", "Gravitational Potential", "Escape Velocity", "Satellite Motion", "Kepler's Laws"], "difficulty": "Medium"},
        {"name": "Properties of Bulk Matter", "unit": "Class 11 - Unit 7", "description": "Elastic behavior, stress-strain, pressure in fluids, Pascal's law, Archimedes principle, surface tension, viscosity, Bernoulli's theorem.", "topics": ["Elasticity", "Hooke's Law", "Fluid Pressure", "Pascal's Law", "Archimedes Principle", "Surface Tension", "Viscosity", "Bernoulli's Theorem"], "difficulty": "Medium"},
        {"name": "Thermodynamics", "unit": "Class 11 - Unit 8", "description": "Thermal equilibrium, laws of thermodynamics, heat engines, Carnot cycle, reversible and irreversible processes.", "topics": ["Zeroth Law", "First Law of Thermodynamics", "Second Law of Thermodynamics", "Heat Engines", "Carnot Cycle", "Entropy"], "difficulty": "Hard"},
        {"name": "Kinetic Theory of Gases", "unit": "Class 11 - Unit 9", "description": "Equation of state, kinetic theory assumptions, pressure and temperature concepts, degrees of freedom, mean free path.", "topics": ["Ideal Gas Equation", "Kinetic Theory", "Molecular Speeds", "Degrees of Freedom", "Equipartition of Energy", "Mean Free Path"], "difficulty": "Medium"},
        {"name": "Oscillations and Waves", "unit": "Class 11 - Unit 10", "description": "Periodic motion, SHM, oscillations of spring and pendulum, wave motion, wave equation, superposition, standing waves.", "topics": ["Simple Harmonic Motion", "Spring Oscillations", "Pendulum", "Wave Motion", "Wave Equation", "Superposition", "Standing Waves"], "difficulty": "Medium"}
    ]
    
    # Physics Chapters - Class 12
    physics_12 = [
        {"name": "Electric Charges and Fields", "unit": "Class 12 - Unit 1", "description": "Electric charge, Coulomb's law, electric field, electric dipole, electric flux, Gauss's theorem.", "topics": ["Electric Charge", "Coulomb's Law", "Electric Field", "Electric Dipole", "Gauss's Law"], "difficulty": "Medium"},
        {"name": "Electrostatic Potential and Capacitance", "unit": "Class 12 - Unit 2", "description": "Electric potential, equipotential surfaces, capacitors, combination of capacitors, energy stored in capacitor.", "topics": ["Electric Potential", "Equipotential Surfaces", "Capacitance", "Capacitor Combinations", "Energy in Capacitor"], "difficulty": "Medium"},
        {"name": "Current Electricity", "unit": "Class 12 - Unit 3", "description": "Electric current, Ohm's law, resistance, Kirchhoff's laws, Wheatstone bridge, potentiometer.", "topics": ["Electric Current", "Ohm's Law", "Resistor Combinations", "Kirchhoff's Laws", "Wheatstone Bridge", "Potentiometer"], "difficulty": "Medium"},
        {"name": "Moving Charges and Magnetism", "unit": "Class 12 - Unit 4", "description": "Magnetic force, Biot-Savart law, Ampere's law, force between conductors, torque on current loop, galvanometer.", "topics": ["Magnetic Force", "Biot-Savart Law", "Ampere's Law", "Force on Conductor", "Torque on Loop", "Galvanometer"], "difficulty": "Hard"},
        {"name": "Magnetism and Matter", "unit": "Class 12 - Unit 5", "description": "Bar magnet, Earth's magnetism, magnetic properties of materials, para, dia and ferromagnetism.", "topics": ["Bar Magnet", "Earth's Magnetism", "Magnetic Materials", "Paramagnetism", "Diamagnetism", "Ferromagnetism"], "difficulty": "Easy"},
        {"name": "Electromagnetic Induction", "unit": "Class 12 - Unit 6", "description": "Faraday's laws, Lenz's law, eddy currents, self and mutual inductance, AC generator.", "topics": ["Faraday's Law", "Lenz's Law", "Eddy Currents", "Self Inductance", "Mutual Inductance", "AC Generator"], "difficulty": "Medium"},
        {"name": "Alternating Current", "unit": "Class 12 - Unit 7", "description": "AC voltage in circuits, L CR series circuit, resonance, power in AC circuits, transformer.", "topics": ["AC Circuits", "LCR Circuit", "Resonance", "Power Factor", "Transformer"], "difficulty": "Hard"},
        {"name": "Electromagnetic Waves", "unit": "Class 12 - Unit 8", "description": "EM waves characteristics, transverse nature, electromagnetic spectrum.", "topics": ["EM Waves", "EM Spectrum", "Properties of EM Waves"], "difficulty": "Easy"},
        {"name": "Ray Optics and Optical Instruments", "unit": "Class 12 - Unit 9", "description": "Reflection, refraction, total internal reflection, lenses, microscope and telescope.", "topics": ["Reflection", "Refraction", "Total Internal Reflection", "Lenses", "Lens Formula", "Microscope", "Telescope"], "difficulty": "Medium"},
        {"name": "Wave Optics", "unit": "Class 12 - Unit 10", "description": "Wavefront, Huygens principle, interference, Young's double slit experiment, diffraction, polarization.", "topics": ["Huygens Principle", "Interference", "Young's Experiment", "Diffraction", "Polarization"], "difficulty": "Medium"},
        {"name": "Dual Nature of Radiation and Matter", "unit": "Class 12 - Unit 11", "description": "Photoelectric effect, Einstein's equation, wave nature of matter, de Broglie wavelength, Davisson-Germer experiment.", "topics": ["Photoelectric Effect", "Einstein's Equation", "de Broglie Wavelength", "Davisson-Germer Experiment"], "difficulty": "Hard"},
        {"name": "Atoms and Nuclei", "unit": "Class 12 - Unit 12", "description": "Rutherford and Bohr models, hydrogen spectrum, nuclear composition, radioactivity, nuclear reactions.", "topics": ["Rutherford Model", "Bohr Model", "Hydrogen Spectrum", "Radioactivity", "Nuclear Reactions"], "difficulty": "Medium"},
        {"name": "Semiconductor Electronics", "unit": "Class 12 - Unit 13", "description": "Energy bands, p-n junction diode, rectifier, transistor, logic gates.", "topics": ["Energy Bands", "PN Junction", "Diode", "Rectifier", "Transistor", "Logic Gates"], "difficulty": "Medium"},
        {"name": "Communication Systems", "unit": "Class 12 - Unit 14", "description": "Communication elements, bandwidth, wave propagation, modulation and demodulation.", "topics": ["Communication Elements", "Bandwidth", "Wave Propagation", "Modulation", "AM", "Demodulation"], "difficulty": "Easy"}
    ]
    
    # Add Physics chapters
    for ch in physics_11 + physics_12:
        ch["subject"] = "Physics"
        ch["status"] = "active"
        seed_data["chapters"].append(ch)
    
    print(f"✅ Added {len(physics_11 + physics_12)} Physics chapters")
    
    # I'll continue with Chemistry and Math in the next parts due to length
    # For now, let's save what we have
    
    with open('/Users/dineshkumar/Documents/examinant-web/scripts/seedData.json', 'w') as f:
        json.dump(seed_data, f, indent=2)
    
    print(f"✅ Generated seed data with {len(seed_data['chapters'])} chapters")
    print("✅ Saved to scripts/seedData.json")

if __name__ == "__main__":
    main()
