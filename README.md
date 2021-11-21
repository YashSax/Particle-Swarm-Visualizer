# Particle-Swarm-Visualizer
Particle Swarm Optimization Visualizer using p5.js!
View at: https://yashsax.github.io/Particle-Swarm-Visualizer/

<h2>What is Particle Swarm Optimization?</h2>
Particle Swarm Optimization (PSO) is a bio-inspired machine learning algorithm that optimizes solutions to a problem by iteratively updating many candidate solutions, or particles, over time. <br></br>

PSO, because it was initially intented to simulate social behavior, exhibits behavior strinkingly similar to that of a flock of birds or a school of fish. The main benefits of using PSO include the ability to have a non-differentiable error function (unlike gradient descent) and the ability to easily parallelize.<br></br>

Learn more about PSO here: https://en.wikipedia.org/wiki/Particle_swarm_optimization

<h2>Part 1: Cursor Following</h2>


https://user-images.githubusercontent.com/46911428/142749902-4132e251-86ac-4139-a384-35d60ed70ab0.mp4

The first part is a cursor-following visualization. Each of the individual particles try to minimize the distance between themselves and the red circle, their particle's velocity governed by three simple rules:  
  
  1) Each particle has an inertia that, like in the physical world, specifies its resistance to changing directions.
  2) Each particle is drawn, with a certain coefficient c<sub>1</sub>, to the best (highest reward) position it's discovered.
  3) Each particle is also drawn, with a certain coefficient c<sub>2</sub>, to the best (highest reward) position the swarm, as a whole, has discovered.

<h2>Part 2: Linear Regression</h2>

The second part is a implementation of simple linear regression. In the previous example, the reward of a particle was calculated by the euclidian distance between it and the target. In this case, the algorithm uses RMSE (Root Mean Squared Error) to determine how well a line fits a particular set of points. Each particle has an associated slope and y-intercept, analagous to how each particle had a (x,y) location in the cursor-following example


<h2>What do the Hyperparameters Mean?</h2>

Hyperparameters, unlike the individual (x,y) velocities of the individual particles, dictate how the swarm, as a whole, operates.  
  
<strong>Inertia</strong>: Inertia represents a particle's willingness to change direction. A low inertia leads to sharper turns, and vice versa.  
<strong>Personal Best Coefficient</strong>: How much a particle is drawn to the best solution its discovered so far. Too high of a personal best coefficient leads to excess wandering, and the swarm might not converge or take a long time to converge.  
<strong>Global Best Coefficient</strong>: How much a particle is drawn to the best solution the swarm has discovered so far. If this is too high, particles will converge prematurely. If this is too low, then particles will wander aimlessly.  
