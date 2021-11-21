# Particle-Swarm-Visualizer
Particle Swarm Optimization Visualizer using p5.js!
View at: https://yashsax.github.io/Particle-Swarm-Visualizer/

<h2>What is Particle Swarm Optimization?</h2>
Particle Swarm Optimization (PSO) is a bio-inspired machine learning algorithm that optimizes solutions to a problem by iteratively updating many candidate solutions, or particles, over time. <br></br>

PSO, because it was initially intented to simulate social behavior, exhibits behavior strinkingly similar to that of a flock of birds or a school of fish. The main benefits of using PSO include the ability to have a non-differentiable error function (unlike gradient descent) and the ability to easily parallelize.<br></br>

Learn more about PSO here: https://en.wikipedia.org/wiki/Particle_swarm_optimization

<h2>Part 1: Cursor Following</h2>


https://user-images.githubusercontent.com/46911428/142749902-4132e251-86ac-4139-a384-35d60ed70ab0.mp4

<p>The first part of the project is a cursor-following visualization. Each of the individual particles try to minimize the distance between themselves and the red circle. Each particle's velocity is governed by three simple rules:  </p>  
  
  1) Each particle has an inertia that, like in the physical world, specifies its resistance to changing directions.
  2) Each particle is drawn, with a certain coefficient c<sub>1</sub>, to the best (highest reward) position it's discovered.
  3) Each particle is also drawn, with a certain coefficient c<sub>2</sub>, to the best (highest reward) position the swarm, as a whole, has discovered.

<h2>Part 2: Linear Regression</h2>
