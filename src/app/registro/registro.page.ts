import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import {
  IonItem,
  IonInput,
  IonLabel,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  AlertController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonInput,
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})
export class RegistroPage implements OnInit {
  usuario: string = '';
  correo: string = '';
  contrasenia: string = '';

  constructor(private router: Router, private http: HttpClient, private alertController: AlertController) { }

  ngOnInit() {}

  registrarse() {
    const usuario = this.usuario;
    const correo = this.correo;
    const contraseña = this.contrasenia;
  
    this.http.post('http://localhost:3000/registro', { usuario, correo, contraseña }).subscribe(
      (response) => {
        this.mostrarAlerta('Registro exitoso', '¡Tu registro ha sido exitoso!');
      },
      (error) => {
        this.mostrarAlerta('Error en el registro', '¡Puede que el correo ya se encuentre registrado!');
      }
    );
  }
  
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
  
    await alert.present();
  }
  

  irAIniciarSesion() {
    this.router.navigateByUrl('/login');
  }
}
