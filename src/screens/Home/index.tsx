import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react'
import { AudioRecorder } from 'react-audio-voice-recorder';
import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton"
import { Player } from '@lottiefiles/react-lottie-player';
import Quack from "../../lotiefiles/quack.json"
import Quack2 from "../../lotiefiles/quack2.json"
import Quack3 from "../../lotiefiles/quack3.json"

type props = {
  content: string;
  title: string;
}
export default function Home() {
  const [state, setState] = useState('')
  const audio_title = "http://localhost:3304/files/title.mp3";
  const audio_content = "http://localhost:3304/files/content.mp3";
  const titleAudio = new Audio(audio_title); // Criando um elemento de áudio
  const contentAudio = new Audio(audio_content); // Criando um elemento de áudio
  const [title, setTitle] = useState('')
  const [url_notion, setUrl_notion] = useState('')
  const [title_notion, setTitle_notion] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      return api.post('/quack/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Indica que estamos enviando um formulário com dados e arquivos
        }
      }).then(response => {
        if (state === 'title') {
          setTitle(response?.data.translate)
        }
        else if (state === 'content') {
          setContent(response?.data.translate)
        }
      });
    },
    onSuccess: () => setLoading(false) // Correção aqui
  });
  const mutationFinal = useMutation({
    mutationFn: (data: props) => {
      return api.post('/quack', data).then(response => {
        setTitle_notion(response?.data.title);
        setUrl_notion(response?.data.url);
        const audioData = response.data.audio; // Supondo que o áudio está em um campo chamado 'audio' na resposta
        const audioUrl = `data:audio/mp3;base64,${audioData}`; // Montando a URL do áudio base64
        const audio = new Audio(audioUrl); // Criando um elemento de áudio
        audio.play(); // Reproduzindo o áudio
      });
    },
    onSuccess: () => setLoading(false) // Correção aqui
  });
  const addAudioElement = async (blob: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', blob, 'audio.mp3');
    mutation.mutate(formData);
  };
  const addAudioElementContent = async (blob: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', blob, 'audio.mp3');
    mutation.mutate(formData);
  };
  async function handleNext() {
    if (state === '') {
      setState('title');
      handlePlay()
    } else if (state === 'title') {
      setState('content')
      handlePlay()
    } else {
      setState('finally')
      setLoading(true)
      mutationFinal.mutate({ title, content });
    }
  }
  // Função para reproduzir áudio
  const handlePlay = () => {
    if (state === '') {
      titleAudio.play();
    }
    else {
      contentAudio.play();
    }
  };


  return (
    <div className="w-full flex h-screen items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 max-sm:px-2">
      <div className="max-w-screen-sm ring-1 rounded-sm p-8 ring-zinc-700 shadow-sm shadow-black bg-white">
      {state === '' && <div className="flex-col items-center justify-center w-full">

        <Player
          src={Quack}
          loop
          autoplay
          className="player h-96"
        />
        <h1 className="text-sm text-center font-bold">Ola, seja bem vindo ao QuackIA, seu assistente para salvar notas no notion sobre seus estudos!</h1>
        <Button className='w-full my-4' onClick={handleNext}>{state === '' ? 'Começar' : 'Avançar'}</Button>
      </div >
      }
      {
        state === 'title' && <div className="text-left">
          <Player
            src={Quack}
            loop
            autoplay
            className="player h-96"
          />
          <Label htmlFor="title" >Titulo</Label>
          <div className="flex-col gap-2 items-center">
            {loading ? <Skeleton className="w-full h-10 rounded-sm" /> :
              <Input disabled={title.length < 1} id='title' onChange={(e) => setTitle(e.target.value)} value={title} />
            }
            <div className="w-full flex items-center justify-center pt-4">
              <AudioRecorder
                onRecordingComplete={addAudioElement}
                showVisualizer={true}
                audioTrackConstraints={{
                  noiseSuppression: true,
                  echoCancellation: true,
                }}
                downloadFileExtension="mp3"
              />
            </div>
          </div>
          <Button className='w-full my-4' onClick={handleNext}>Avançar</Button>

        </div>
      }
      {
        state === 'content' && <div className="text-left">
          <Player
            src={Quack}
            loop
            autoplay
            className="player h-96"
          />

          <Label htmlFor="content">Seu resumo</Label>
          <div className="flex-col gap-2 items-center">
            {loading ? <Skeleton className="w-full h-24 rounded-sm" /> :
              <Textarea id='content' onChange={(e) => setContent(e.target.value)} value={content} />
            }
            <div className="w-full flex items-center justify-center pt-4">
              <AudioRecorder
                onRecordingComplete={addAudioElementContent}
                showVisualizer={true}
                audioTrackConstraints={{
                  noiseSuppression: true,
                  echoCancellation: true,
                }}
                downloadFileExtension="mp3"
              />
            </div>
          </div>
          <Button className='w-full my-4' onClick={handleNext}>Enviar</Button>
        </div>
      }
      {
        state === 'finally' && <div className="text-left">
          <Player
            src={Quack3}
            loop
            autoplay
            className="player h-44"
          />

          {
            loading ? <Skeleton className="w-full h-4 my-2" /> : <a target="_blank" className="text-sm font-bold" href={url_notion}> {title_notion}</a>
          }
          <Button className='w-full my-4' disabled={loading} onClick={handleNext}><a href={url_notion} target="_blank" rel="noopener noreferrer">Acessar</a></Button>

        </div>
      }
</div>
    </div>
  )
};
